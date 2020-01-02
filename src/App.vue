<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'App',
  async created () {
    let { state, commit } = this.$store

    state.firebase.auth().languageCode = 'ja'
    await this.verifyRedirectFromLine()
    await this.verifyInvitationUrl()
    await this.getServiceStatus({ i18n: this.$root.$i18n })

    state.firebase.auth().onAuthStateChanged(async user => {
      commit('setLoading', 'auth')
      await this.verifyEmailLink()
      if (user) {
        await this.onSignIn({ user, i18n: this.$root.$i18n })
      } else {
        await this.onSignOut({ i18n: this.$root.$i18n })
      }
      this.$router.push(this.me ? (state.reqPage || { name: 'top' }) : { name: 'signin' }).catch(e => {})
      setTimeout(() => { commit('resetLoading', 'auth') }, 300)
    })
    commit('resetLoading', 'start')
  },
  methods: {
    ...mapActions([
      'verifyRedirectFromLine',
      'verifyInvitationUrl',
      'verifyEmailLink',
      'getServiceStatus',
      'onSignIn',
      'onSignOut'
    ])
  },
  computed: {
    ...mapGetters([
      'me'
    ])
  }
}
</script>
