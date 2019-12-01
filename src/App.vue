<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

const getReuestedRoute = () => {
  try {
    return this.$router.resolve(JSON.parse(window.localStorage.getItem('reqPage'))).route
  } catch (e) {
    return null
  }
}

export default {
  name: 'App',
  async created () {
    let { state, commit } = this.$store

    state.firebase.auth().languageCode = 'ja'
    state.reqPage = getReuestedRoute()
    await this.verifyRedirectFromLine()
    await this.verifyInvitationUrl()
    await this.getServiceStatus({ i18n: this.$root.$i18n })

    state.firebase.auth().onAuthStateChanged(async user => {
      commit('setLoading', 'auth')
      await this.verifyEmailLink()
      if (user) {
        await this.onSignIn({ user, i18n: this.$root.$i18n })
        this.$router.push(state.reqPage || { name: 'top' }).catch(e => {})
      } else if (state.me) {
        await this.onSignOut({ i18n: this.$root.$i18n })
        this.$router.push({ name: 'signin' }).catch(e => {})
      }
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
  }
}
</script>
