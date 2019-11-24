import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function ({ store } /* { store, ssrContext } */) {
  const router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  router.beforeEach((to, from, next) => {
    var replace = null
    if (to.name === 'policy') {
      replace = null
    } else if (store.state.loading) {
      replace = { name: 'loading' }
    } else if ((!store.state.loading) && (to.path === '/loading')) {
      replace = { name: 'top' }
    } else if (!store.getters.isValidAccount) {
      replace = { name: 'signin' }
    } else if (!store.getters.isSignInMethod) {
      replace = { name: 'preferences' }
    } else if ([ 'signin' ].includes(to.name)) {
      replace = { name: 'top' }
    } else if ([
      'accounts',
      'properties'
    ].includes(to.name) && (!store.getters.isManager)) {
      replace = { name: 'top' }
    } else if ([
      'service',
      'raw'
    ].includes(to.name) && (!store.getters.isAdmin)) {
      replace = { name: 'top' }
    }

    // Call next() once exactly.
    if (!replace) {
      next()
    } else if (replace.path === to.path) {
      next()
    } else if (replace.path === from.path) {
      next(false)
    } else {
      next(replace)
    }
  })

  return router
}
