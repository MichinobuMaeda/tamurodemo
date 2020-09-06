<template>
  <div class="light-green--text text--darken-3 text-h5 mb-4">
    <v-icon color="light-green darken-3">{{ icon }}</v-icon>
    {{ title }}
  </div>
</template>

<script>
import store from '../plugins/composition-api'

export default {
  name: 'Loading',
  props: ['icon', 'title'],
  setup () {
    // 保持データのストアを使用する。
    const rootStore = store.useStore()
    return rootStore
  }
}
</script>
