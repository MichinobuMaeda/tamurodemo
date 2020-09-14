<template>
  <v-row>
    <v-col col="12">
      <PageTitle title="Raw data" icon="memory" />
      <v-treeview
        :items="rawTree(state)"
        dense
      >
        <template v-slot:label="{ item }">
          <span class="light-green--text text--darken-3">{{ item.name }}:</span> {{ item.value }}
        </template>
      </v-treeview>
    </v-col>
  </v-row>
</template>

<script>
import store from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'

export default {
  name: 'RawData',
  components: {
    PageTitle
  },
  setup () {
    return store.useStore()
  }
}
</script>
