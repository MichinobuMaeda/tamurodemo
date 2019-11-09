import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function ({ store } /* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach(async (to, from, next) => {
    if (store.state.firebase.auth().isSignInWithEmailLink(window.location.href)) {
      const savedSessionState = window.localStorage.getItem('sessionState')
      const sessionState = savedSessionState ? JSON.parse(savedSessionState) : null
      if (sessionState && sessionState.email) {
        if (!sessionState.link) {
          await store.state.firebase.auth().signInWithEmailLink(
            sessionState.email,
            window.location.href
          )
          window.localStorage.removeItem('sessionState')
          window.location.href = window.location.href.replace(/\?.*/, '') + '?v=' + store.state.version + '#/'
        }
      } else {
        window.location.href = window.location.href.replace(/\?.*/, '') + '?v=' + store.state.version + '#/signin'
      }
    } else if (window.location.href.includes('?signinwith=line')) {
      await store.dispatch('verifyRedirectFromLine')
    } else if (window.location.href.includes('&invitation=')) {
      let token = window.location.href.replace(/.*&invitation=/, '').replace(/#\/.*/, '')
      await store.state.firebase.auth().signInWithCustomToken(token)
      window.location.href = window.location.href.replace(/&invitation=.*/, '')
    } else if (to.path === '/policy') {
      next()
    } else if (store.state.loading) {
      if (to.path === '/loading') {
        next()
      } else {
        next('/loading')
      }
    } else if ((!store.state.loading) && (to.path === '/loading')) {
      next('/')
    } else if (store.getters.isValidUser) {
      if ((to.path !== '/preferences') && (!store.getters.isSignInMethod)) {
        next('/preferences')
      } else if (['/signin'].includes(to.path)) {
        next('/')
      } else if ([
        '/accounts',
        '/properties',
        '/streets'
      ].includes(to.path) && (!store.getters.isAdminOrManager)) {
        next('/')
      } else if ([
        '/service',
        '/debug'
      ].includes(to.path) && (!store.getters.isAdmin)) {
        next('/')
      } else {
        next()
      }
    } else if (to.path !== '/signin') {
      next('/signin')
    } else {
      next()
    }
  })

  return Router
}
