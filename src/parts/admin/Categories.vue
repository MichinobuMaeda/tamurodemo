<template>
  <v-row>
    <v-col class="col-12">
      <v-row
        v-for="(item, index) in page.items" :key="item.id"
        :class="item.deletedAt ? 'deleted' : ''"
      >
        <v-col class="col-1 pt-4">
          <MiniButton
            :icon="icon('Upward')"
            :disabled="!!item.deletedAt || index === 0"
            @click="onUpward(index)"
          />
        </v-col>
        <v-col class="col-1 pt-4">
          <MiniButton
            :icon="icon('Downward')"
            :disabled="!!item.deletedAt || index === (page.items.length - 1) || !!page.items[index + 1].deletedAt"
            @click="onDownward(index)"
          />
        </v-col>
        <v-col class="col-8">
          <v-text-field
            class="my-0 py-0"
            v-model="item.name"
            :rules="item.id ? [ruleRequired] : []"
            :disabled="!!item.deletedAt"
          />
        </v-col>
        <v-col class="col-2 pt-4 text-center">
          <MiniButton
            v-if="item.id && !item.deletedAt"
            :icon="icon('Delete')"
            @click="onDelete(index)"
          />
          <MiniButton
            v-if="item.id && item.deletedAt"
            :icon="icon('Restore')"
            @click="onUndoDelete(index)"
          />
          <MiniButton
            v-if="!item.id && item.name"
            :icon="icon('Cancel')"
            @click="item.name = ''"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-right">
          <DefaultButton
            color="secondary"
            :label="$t('Cancel')"
            @click="onCancel"
          />
          <DefaultButton
            color="primary"
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
import { useStore, findItem } from '../../store'
import MiniButton from '../../components/MiniButton'
import DefaultButton from '../../components/DefaultButton'

export default {
  name: 'SectionCategories',
  components: {
    MiniButton,
    DefaultButton
  },
  setup () {
    const store = useStore()
    const { db, waitFor, add, update, remove } = store
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

    const onSave = () => waitFor(
      async () => {
        page.items = reOrder(page.items)
        await Promise.all(
          page.items.filter(item => (!item.id && item.name) ||
            (item.id &&
              (
                (findItem(store.state.categories, item.id).seq !== item.seq) ||
                (findItem(store.state.categories, item.id).name !== item.name) ||
                (findItem(store.state.categories, item.id).deletedAt !== item.deletedAt)
              )
            )
          ).map(async item => {
            const { seq, name } = item
            if (item.id) {
              if (item.seq) {
                return update(item, {
                  seq, name, deletedAt: null
                })
              } else {
                return remove(item)
              }
            } else {
              return add(db.collection('categories'), { seq, name, groups: [] })
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
      onSave: () => waitFor(onSave),
      modified
    }
  }
}
</script>
