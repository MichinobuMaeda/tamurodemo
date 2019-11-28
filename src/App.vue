<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'App',
  async created () {
    await this.onAppCreated({ router: this.$router, i18n: this.$root.$i18n })
  },
  watch: {
    async 'loading' (newValue, oldValue) {
      if (newValue && (!oldValue)) {

      }
    }
  },
  methods: {
    ...mapActions([
      'onAppCreated',
      'onLoadingCompleted'
    ])
  },
  computed: {
    ...mapState([
      'loading'
    ])
  }
}
</script>
