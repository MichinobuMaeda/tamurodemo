<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="conf.icon('Privacy policy')"
      >
        <template v-slot:title>{{ $t('Privacy policy') }}</template>
      </PageTitle>
      <FormattedTextEditor
        v-model="policy"
        placeholder="Privacy policy"
        :editable="me.priv && me.priv.manager"
      />
    </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '@/store'
import PageTitle from '@/components/PageTitle'
import FormattedTextEditor from '@/components/FormattedTextEditor'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    FormattedTextEditor
  },
  setup () {
    const store = useStore()
    const { state, waitFor, update } = store

    return {
      ...store,
      policy: computed({
        get: () => state.service.conf && state.service.conf.policy,
        set: str => waitFor(() => update(state.service.conf, { policy: str }))
      })
    }
  }
}
</script>
