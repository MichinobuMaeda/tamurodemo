<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Privacy policy')"
        :icon="icon('Privacy policy')"
      />
      <div v-html="compiledMarkdown(state.service.conf.policy)"></div>
    </v-col>
  </v-row>
</template>

<script>
import store from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle
  },
  setup () {
    return store.useStore()
  }
}
</script>
