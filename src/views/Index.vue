<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="color.pageTitle"
        :icon-color="color.pageIcon"
        :title="$t('Top')"
        :icon="icon('Top')"
      />
    </v-col>
  </v-row>
</template>

<script>
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'

export default {
  name: 'PageIndex',
  components: {
    PageTitle
  },
  setup () {
    const { useStore } = helpers
    const store = useStore()
    return {
      ...store,
      ...helpers
    }
  }
}
</script>
