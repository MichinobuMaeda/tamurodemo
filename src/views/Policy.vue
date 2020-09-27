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
        @save="val => updateStoreService('conf', { policy: val})"
      />
    </v-col>
  </v-row>
</template>

<script>
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableRichText from '@/components/EditableRichText'
import {reactive} from "@vue/composition-api";

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    EditableRichText
  },
  setup () {
    const { useStore, setProcForWait } = helpers
    const store = useStore()
    const { updateStore } = store

    const page = reactive({
      waitProc: false
    })
    return {
      ...store,
      page,
      updateStoreService: (id, data) => setProcForWait(
        page,
        () => updateStore('service', id, data)
      ),
      ...helpers
    }
  }
}
</script>
