<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle title="Tamuro" icon="list" />
    </v-col>
  </v-row>
</template>

<style>
.itemlist thead {
  background-color: lightblue;
}
</style>

<script>
import store from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
// import ButtonPrimary from '../components/ButtonPrimary'

export default {
  name: 'PageIndex',
  components: {
    PageTitle
  },
  setup () {
    // 保持データのストアを使用する。
    const rootStore = store.useStore()
    return rootStore
  }
}
</script>
