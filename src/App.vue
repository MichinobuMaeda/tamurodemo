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
    await this.onAppCreated({ router: this.$router, i18n: this.$root.$i18n })
  },
  methods: {
    ...mapActions([ 'onAppCreated' ])
  }
}
</script>
