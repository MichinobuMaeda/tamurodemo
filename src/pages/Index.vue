<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="priv.manager || priv.admin"
        color="primary"
        class="float-right my-0"
        v-model="page.edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Top')"
      >
        <template v-slot:title>{{ $t('Top') }}</template>
      </PageTitle>

      <v-sheet
        v-if="page.edit || (state.service.conf.desc && state.service.conf.desc.data)"
        outlined rounded class="px-3 pt-3"
      >
        <EditableItem
          type="formatted-text"
          :label="$t('Description')"
          v-model="state.service.conf.desc"
          @save="val => waitForUpdate('service', 'conf', { desc: val })"
          :editable="page.edit && priv.manager"
          :disabled="!!state.waitProc"
        />
      </v-sheet>

      <div
        v-for="category in state.categories.filter(item => !item.deletedAt)" :key="category.id"
        class="my-2"
      >
        <v-chip color="h3" outlined>
          <v-icon>{{ icon('Category') }}</v-icon>
          {{ category.name }}
        </v-chip>
        <LinkButton
          v-for="group in (category.groups || []).map(id => state.groups.find(group => group.id === id)).filter(group => group && !group.deletedAt)" :key="group.id"
          :icon="icon('Group')"
          :label="group.name"
          @click="goPageGroup(group.id)"
        />
      </div>

      <div
        v-if="uncategorizedGroups.length"
        class="my-2"
      >
        <v-chip color="h3" outlined>
          <v-icon>{{ icon('Category') }}</v-icon>
          {{ $t('Uncategorized') }}
        </v-chip>
        <LinkButton
          v-for="group in uncategorizedGroups" :key="group.id"
          :icon="icon('Group')"
          :label="group.name"
          @click="goPageGroup(group.id)"
        />
      </div>

      <div v-if="page.edit && (priv.manager || priv.admin)">

        <div
          v-if="deletedGroups.length"
          class="my-2"
        >
          <v-chip color="h3" outlined>
            <v-icon>{{ icon('Category') }}</v-icon>
            {{ $t('Deleted groups') }}
          </v-chip>
          <LinkButton
            v-for="group in deletedGroups" :key="group.id"
            :icon="icon('Group')"
            :label="group.name"
            @click="goPageGroup(group.id)"
          />
        </div>

        <v-divider class="my-2" />

        <CreateGroup />

      </div>

    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import { useStore } from '@/utils'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'
import LinkButton from '@/components/LinkButton'
import CreateGroup from '@/parts/CreateGroup'

export default {
  name: 'PageIndex',
  components: {
    PageTitle,
    EditableItem,
    LinkButton,
    CreateGroup
  },
  setup () {
    const store = useStore()
    const page = reactive({
      edit: false
    })

    const uncategorizedGroups = computed(
      () => store.state.groups
        .filter(group =>
          !group.deletedAt &&
          !store.state.categories.some(
            category => !category.deletedAt && (category.groups || []).includes(group.id)
          )
        )
    )

    const deletedGroups = computed(
      () => store.state.groups
        .filter(group => group.deletedAt)
    )

    return {
      page,
      ...store,
      uncategorizedGroups,
      deletedGroups
    }
  }
}
</script>
