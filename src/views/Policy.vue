<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Privacy policy')"
        :icon="icon('Privacy policy')"
      />
      <Markdown :src="state.service.conf.policy" />
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import Markdown from '../components/Markdown'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    Markdown
  },
  setup () {
    return useStore()
  }
}
</script>
