<template>
  <v-row>
    <v-col col="12">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Raw data')"
        :icon="icon('Raw data')"
      />
      <RawDataTree
        :text-color="state.color.pageTitle"
        :state="state"
      />
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import RawDataTree from '../components/RawDataTree'

export default {
  name: 'PageRawData',
  components: {
    PageTitle,
    RawDataTree
  },
  setup () {
    return useStore()
  }
}
</script>
