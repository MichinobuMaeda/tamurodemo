<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :title="$t('Categories')"
        :icon="icon('Categories')"
      />
      <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
      <v-row
        v-for="(item, index) in page.items" :key="item.id"
        :class="item.deletedAt ? 'deleted' : ''"
      >
        <v-col class="col-1 pt-8">
          <mini-button
            :icon="icon('Upward')"
            :disabled="!!item.deletedAt || index === 0"
            @click="onUpward(index)"
          />
        </v-col>
        <v-col class="col-1 pt-8">
          <mini-button
            :icon="icon('Downward')"
            :disabled="!!item.deletedAt || index === (page.items.length - 1) || !!page.items[index + 1].deletedAt"
            @click="onDownward(index)"
          />
        </v-col>
        <v-col class="col-9">
          <v-text-field
            v-model="item.name"
            :rules="[v => !item.id || !!v || $t('Required')]"
            :disabled="!!item.deletedAt"
          />
        </v-col>
        <v-col class="col-1 pt-8 text-right">
          <mini-button
            v-if="item.id && !item.deletedAt"
            :icon="icon('Delete')"
            @click="onDelete(index)"
          />
          <mini-button
            v-if="item.id && item.deletedAt"
            :icon="icon('Undo delete')"
            @click="onUndoDelete(index)"
          />
          <mini-button
            v-if="!item.id && item.name"
            :icon="icon('Cancel')"
            @click="item.name = ''"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-right">
          <ButtonSecondary
            :label="$t('Cancel')"
            @click="onCancel"
          />
          <ButtonPrimary
            :label="$t('Save')"
            @click="onSave"
            :disabled="!!state.waitProc || !modified"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed, onMounted } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import MiniButton from '@/components/MiniButton'
import ButtonPrimary from '@/components/ButtonPrimary'
import ButtonSecondary from '@/components/ButtonSecondary'

const { useStore, getById } = helpers

export default {
  name: 'PageCategories',
  components: {
    MiniButton,
    ButtonPrimary,
    ButtonSecondary,
    PageTitle
  },
  setup () {
    const store = useStore()
    const { setProcForWait } = store
    const page = reactive({
      items: []
    })

    const reOrder = items => {
      var seq = 0
      return [
        ...items.filter(item => item.name && !item.deletedAt).map(item => ({
          ...item,
          seq: ++seq
        })),
        {
          id: null,
          seq: ++seq,
          name: ''
        },
        ...items.filter(item => (item.id && !item.name) || item.deletedAt).map(item => ({
          ...item,
          seq: null,
          deletedAt: item.deletedAt || new Date()
        }))
      ]
    }

    onMounted(() => {
      page.items = reOrder(store.state.categories)
    })

    const onUpward = index => {
      if (index > 0) {
        const items = [...page.items]
        items[index] = { ...page.items[index - 1], seq: items[index].seq }
        items[index - 1] = { ...page.items[index], seq: items[index - 1].seq }
        page.items = items
      }
    }

    const onDownward = index => {
      if (index < (page.items.length - 1)) {
        const items = [...page.items]
        items[index] = { ...page.items[index + 1], seq: items[index].seq }
        items[index + 1] = { ...page.items[index], seq: items[index + 1].seq }
        page.items = items
      }
    }

    const onDelete = index => {
      page.items[index].deletedAt = new Date()
      page.items = reOrder(page.items)
    }

    const onUndoDelete = index => {
      page.items[index].deletedAt = null
      page.items[index].seq = page.items.length
      page.items = reOrder(page.items)
    }

    const onCancel = () => {
      page.items = reOrder(store.state.categories)
    }

    const onSave = () => setProcForWait(
      async () => {
        page.items = reOrder(page.items)
        await Promise.all(
          page.items.filter(item => (!item.id && item.name) ||
            (item.id &&
              (
                (getById(store.state.categories, item.id).seq !== item.seq) ||
                (getById(store.state.categories, item.id).name !== item.name) ||
                (getById(store.state.categories, item.id).deletedAt !== item.deletedAt)
              )
            )
          ).map(async item => {
            const { seq, name } = item
            if (item.id) {
              if (item.seq) {
                return store.set('categories', item.id, {
                  seq, name, deletedAt: null
                })
              } else {
                return store.del('categories', item.id)
              }
            } else {
              return store.add('categories', { seq, name })
            }
          })
        )
        page.items = reOrder(store.state.categories)
      }
    )

    const modified = computed(() => {
      const org = reOrder(store.state.categories || [])
      const cmp = page.items || []
      return (org.length !== cmp.length) ||
        org.some((item, i) => !(
          org[i].id === cmp[i].id &&
          org[i].seq === cmp[i].seq &&
          org[i].name === cmp[i].name &&
          !!org[i].deletedAt === !!cmp[i].deletedAt
        ))
    })

    return {
      ...store,
      page,
      onUpward,
      onDownward,
      onDelete,
      onUndoDelete,
      onCancel,
      onSave: () => setProcForWait(onSave),
      modified,
      ...helpers
    }
  }
}
</script>
