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
    if (to.path === '/policy') {
      replace = null
    } else if (store.state.loading) {
      replace = '/loading'
    } else if ((!store.state.loading) && (to.path === '/loading')) {
      replace = '/'
    } else if (!store.getters.isValidAccount) {
      replace = '/signin'
    } else if (!store.getters.isSignInMethod) {
      replace = '/preferences'
    } else if (['/signin'].includes(to.path)) {
      replace = '/'
    } else if ([
      '/accounts',
      '/properties',
      '/streets'
    ].includes(to.path) && (!store.getters.isManager)) {
      replace = '/'
    } else if ([
      '/service',
      '/raw'
    ].includes(to.path) && (!store.getters.isAdmin)) {
      replace = '/'
    }

    // Call next() once exactly.
    if (!replace) {
      next()
    } else if (replace === to.path) {
      next()
    } else if (replace === from.path) {
      next(false)
    } else {
      next(replace)
    }
  })

  return router
}
