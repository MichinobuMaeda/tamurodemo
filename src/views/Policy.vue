<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Privacy policy')"
        :icon="icon('Privacy policy')"
      />
      <EditableRichText
        v-model="state.service.conf.policy"
        :editable="isManager(state)"
        :icon-edit="icon('Edit')"
        :cancel-text="$t('Cancel')"
        :save-text="$t('Save')"
        @save="val => waitProc(state, () => updateServiceConf('policy', val))"
      />
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import EditableRichText from '../components/EditableRichText'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    EditableRichText
  },
  setup () {
    return useStore()
  }
}
</script>
