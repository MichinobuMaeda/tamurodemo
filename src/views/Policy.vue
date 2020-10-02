<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :title="$t('Privacy policy')"
        :icon="icon('Privacy policy')"
      />
      <EditableItem
        type="formatted-text"
        :label="$t('Privacy policy')"
        v-model="state.service.conf.policy"
        @save="val => set('service', 'conf', { policy: val })"
        :editable="priv.manager"
        :disabled="!!state.waitProc"
      />
    </v-col>
  </v-row>
</template>

<script>
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

    return {
      ...store,
      ...helpers
    }
  }
}
</script>
