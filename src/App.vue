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
    this.$store.state.firebase.auth().languageCode = 'ja'
    await this.onServiceChanged()
    await this.onAuthStateChanged(this.$router)
  },
  methods: {
    ...mapActions([ 'onServiceChanged', 'onAuthStateChanged' ])
  }
}
</script>
