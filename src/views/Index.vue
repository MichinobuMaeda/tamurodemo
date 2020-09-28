<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="color.pageTitle"
        :icon-color="color.pageIcon"
        :title="$t('Top')"
        :icon="icon('Top')"
      />
      <EditableRichText
        v-model="state.service.conf.desc"
        :editable="priv.manager"
        :icon-edit="icon('Edit')"
        :cancel-text="$t('Cancel')"
        :save-text="$t('Save')"
        @save="val => set('service', 'conf', { desc: val })"
        :disabled="!!state.waitProc"
      />
      <div
        v-for="category in state.categories" :key="category.id"
        :class="color.level2Title + ' text-h6 py-2'"
      >
        <v-icon :color="color.level2Icon">{{ icon('Category') }}</v-icon>
        <span class="ma-2">{{ category.name }}</span>
      </div>
      <div
        v-if="uncategorizedGroups.length"
        :class="color.level2Title + ' text-h6 py-2'"
      >
        <v-icon :color="color.level2Icon">{{ icon('Category') }}</v-icon>
        <span class="ma-2">{{ $t('Uncategorized') }}</span>
      </div>
      <div
        v-for="group in uncategorizedGroups"
        :key="group.id"
      >
        <LinkButton
          :icon="icon('Group')"
          :label="group.name"
        />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { computed } from "@vue/composition-api";
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableRichText from "@/components/EditableRichText";
import LinkButton from "@/components/LinkButton";

const { useStore } = helpers

export default {
  name: 'PageIndex',
  components: {
    PageTitle,
    EditableRichText,
    LinkButton
  },
  setup () {
    const store = useStore()

    const uncategorizedGroups = computed(
      () => (store.state.groups || []).filter(
        group => !store.state.categories.some(
          category => (group.categories || []).includes(category.id))
      )
    )

    return {
      ...store,
      uncategorizedGroups,
      ...helpers
    }
  }
}
</script>
