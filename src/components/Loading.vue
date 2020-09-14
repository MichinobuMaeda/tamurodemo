<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-progress-circular
        indeterminate
        size="96"
        color="light-green darken-2"
      />
    </v-layout>
  </v-container>
</template>

<script>
import store from '../plugins/composition-api'

export default {
  name: 'Loading',
  setup () {
    // 保持データのストアを使用する。
    const rootStore = store.useStore()
    return rootStore
  }
}
</script>
