<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="state.priv.manager || state.priv.admin"
        color="primary"
        class="float-right my-0"
        v-model="page.edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Privacy policy')"
      >
        <template v-slot:title>{{ $t('Privacy policy') }}</template>
      </PageTitle>
      <EditableItem
        type="formatted-text"
        :label="$t('Privacy policy')"
        v-model="state.service.conf.policy"
        @save="val => set('service', 'conf', { policy: val })"
        :editable="page.edit && state.priv.manager"
        :disabled="!!state.waitProc"
      />
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'

const { useStore } = helpers

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    EditableItem
  },
  setup () {
    const store = useStore()
    const page = reactive({
      edit: false
    })

    return {
      page,
      ...store,
      ...helpers
    }
  }
}
</script>
