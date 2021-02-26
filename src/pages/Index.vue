<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="conf.icon('Top')"
      >
        <template v-slot:title>{{ $t('Top') }}</template>
      </PageTitle>

      <Chats
        class="my-2"
        :height="state.chatSummaryPaneHeight"
      />

      <FormattedTextEditor
        :placeholder="$t('Introduction of the site')"
        v-model="desc"
        :editable="me.priv.manager"
        :disabled="!!state.waitProc"
      />

      <div
        v-for="category in state.categories.filter(item => !item.deletedAt)" :key="category.id"
        class="mb-2"
      >
        <v-chip color="h3" outlined>
          <v-icon>{{ conf.icon('Category') }}</v-icon>
          {{ category.name }}
        </v-chip>
        <LinkButton
          v-for="group in (category.groups || []).map(id => state.groups.find(group => group.id === id)).filter(group => group && !group.deletedAt)" :key="group.id"
          :icon="conf.icon('Group')"
          :label="group.name"
          @click="goPageGroup(group.id)"
        />
      </div>

      <v-card v-if="me.priv.manager || me.priv.admin" class="mt-4">
        <v-card-title class="pa-0">
          <v-alert type="info" text dense width="100%">{{ $t('Administrators only') }}</v-alert>
        </v-card-title>
        <v-card-text>
          <div
            v-if="uncategorizedGroups.length"
            class="my-2"
          >
            <v-chip color="h3" outlined>
              <v-icon>{{ conf.icon('Category') }}</v-icon>
              {{ $t('Uncategorized') }}
            </v-chip>
            <LinkButton
              v-for="group in uncategorizedGroups" :key="group.id"
              :icon="conf.icon('Group')"
              :label="group.name"
              @click="goPageGroup(group.id)"
            />
          </div>

          <div
            v-if="deletedGroups.length"
            class="my-2"
          >
            <v-chip color="h3" outlined>
              <v-icon>{{ conf.icon('Category') }}</v-icon>
              {{ $t('Deleted groups') }}
            </v-chip>
            <LinkButton
              v-for="group in deletedGroups" :key="group.id"
              :icon="conf.icon('Group')"
              :label="group.name"
              @click="goPageGroup(group.id)"
            />
          </div>

          <CreateGroup v-if="me.priv.manager" class="mt-4" />

        </v-card-text>
      </v-card>

    </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../store'
import PageTitle from '../components/PageTitle'
import FormattedTextEditor from '../components/FormattedTextEditor'
import LinkButton from '../components/LinkButton'
import Chats from '../parts/Chats'
import CreateGroup from '../parts/admin/CreateGroup'

export default {
  name: 'PageIndex',
  components: {
    PageTitle,
    FormattedTextEditor,
    LinkButton,
    Chats,
    CreateGroup
  },
  setup () {
    const store = useStore()
    const { state, waitFor, update } = store

    return {
      ...store,
      uncategorizedGroups: computed(() => state.groups.filter(group => group.id === 'all' || (
        !group.deletedAt &&
        !store.state.categories.some(
          category => !category.deletedAt && (category.groups || []).includes(group.id)
        )
      ))),
      deletedGroups: computed(() => state.groups.filter(group => group.deletedAt)),
      desc: computed({
        get: () => state.service.conf && state.service.conf.desc,
        set: str => waitFor(() => update(state.service.conf, { desc: str }))
      })
    }
  }
}
</script>
