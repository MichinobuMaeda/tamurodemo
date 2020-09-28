<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="color.pageTitle"
        :icon-color="color.pageIcon"
        :title="$t('Privacy policy')"
        :icon="icon('Privacy policy')"
      />
      <EditableRichText
        v-model="state.service.conf.policy"
        :editable="priv.manager"
        :icon-edit="icon('Edit')"
        :cancel-text="$t('Cancel')"
        :save-text="$t('Save')"
        @save="val => set('service', 'conf', { policy: val })"
        :disabled="!!state.waitProc"
      />
    </v-col>
  </v-row>
</template>

<script>
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableRichText from '@/components/EditableRichText'

const { useStore } = helpers

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    EditableRichText
  },
  setup () {
    const store = useStore()

    return {
      ...store,
      ...helpers
    }
  }
}
</script>
