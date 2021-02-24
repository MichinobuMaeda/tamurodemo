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
      <div class="formatted-text" v-html="formatText(state.service.conf && state.service.conf.policy)"></div>
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '@/store'
import PageTitle from '@/components/PageTitle'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle
  },
  setup () {
    const store = useStore()

    return {
      ...store
    }
  }
}
</script>
