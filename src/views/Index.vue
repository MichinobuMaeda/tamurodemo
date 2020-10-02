<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :title="$t('Top')"
        :icon="icon('Top')"
      />
      <EditableItem
        type="formatted-text"
        :label="$t('Description')"
        v-model="state.service.conf.desc"
        @save="val => set('service', 'conf', { desc: val })"
        :editable="priv.manager"
        :disabled="!!state.waitProc"
      />

      <div
        v-for="category in state.categories.filter(item => !item.deletedAt)" :key="category.id"
        class="h3--text text-h3 py-2"
      >
        <v-icon color="h3" size="1.2rem">{{ icon('Category') }}</v-icon>
        <span class="ma-2">{{ category.name }}</span>
        <div v-for="group in groupsOfCatecogry[category]" :key="group.id">
          <LinkButton
            :icon="icon('Group')"
            :label="group.name"
          />
        </div>
      </div>

      <div v-if="uncategorizedGroups.length">
        <div class="h3--text text-h3 py-2">
          <v-icon color="h3" size="1.2rem">{{ icon('Category') }}</v-icon>
          <span class="ma-2">{{ $t('Uncategorized') }}</span>
        </div>
        <div v-for="group in uncategorizedGroups" :key="group.id">
          <LinkButton
            :icon="icon('Group')"
            :label="group.name"
            @click="goPage($router, { name: 'groups', params: { id: group.id } })"
          />
        </div>
      </div>

      <div v-if="priv.manager || priv.admin">
        <v-divider class="my-6" />
        <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
        <ButtonPrimary
          :icon="icon('Add')"
          :label="$t('Create new', { type: $t('group') })"
        />
        <div v-if="deletedGroups.length">
          <div class="h3--text text-h3 py-2">
            <v-icon color="h3" size="1.2rem">{{ icon('Category') }}</v-icon>
            <span class="ma-2">{{ $t('Deleted groups') }}</span>
          </div>
          <div v-for="group in deletedGroups" :key="group.id">
            <LinkButton
              :icon="icon('Group')"
              :label="group.name"
            />
          </div>
        </div>
      </div>

    </v-col>
  </v-row>
</template>

<script>
import { computed } from "@vue/composition-api";
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableItem from "@/components/EditableItem";
import ButtonPrimary from "@/components/ButtonPrimary";
import LinkButton from "@/components/LinkButton";

const { useStore } = helpers

export default {
  name: 'PageIndex',
  components: {
    PageTitle,
    EditableItem,
    ButtonPrimary,
    LinkButton
  },
  setup () {
    const store = useStore()

    const groupsOfCatecogry = computed(
      () => store.state.categories.reduce(
        (ret, cur) => ({
          ...ret,
          [cur]: store.state.groups
            .filter(group =>
              (group.categories || []).includes(cur.id) &&
              !group.deletedAt
            )
        }),
        {}
      )
    )

    const uncategorizedGroups = computed(
      () => store.state.groups
        .filter(group =>
          !store.state.categories.some(
            category => (group.categories || []).includes(category.id)
          ) &&
          !group.deletedAt
      )
    )

    const deletedGroups = computed(
      () => store.state.groups
        .filter(group => group.deletedAt)
    )

    return {
      ...store,
      groupsOfCatecogry,
      uncategorizedGroups,
      deletedGroups,
      ...helpers
    }
  }
}
</script>
