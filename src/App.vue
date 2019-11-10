<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'App',
  async created () {
    await this.onAppCreated(this.$router)
  },
  methods: {
    ...mapActions([ 'onAppCreated' ])
  }
}
</script>
