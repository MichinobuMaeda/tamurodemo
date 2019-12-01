import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

const getReuestedPage = ({ state }, router) => {
  try {
    state.reqPage = router.resolve(JSON.parse(window.localStorage.getItem('reqPage'))).route
  } catch (e) {
    state.reqPag = null
  }
}

const setReuestedPage = ({ state }, to) => {
  let { name, params } = to
  try {
    window.localStorage.setItem('reqPage', JSON.stringify({ name, params }))
    state.reqPage = to
  } catch (e) {
    return null
  }
}

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
    getReuestedPage(store, router)
    if (from.name === 'policy') {
      if (![ 'signin' ].includes(to.name)) {
        setReuestedPage(store, to)
      }
    } else {
      if (![ 'top', 'signin', 'preferences' ].includes(to.name)) {
        setReuestedPage(store, to)
      }
    }

    var replace = null
    if (to.name === 'policy') {
      // pass thru
    } else if (store.state.loading.length) {
      // pass thru
    } else if (!store.getters.isValid) {
      if (to.name !== 'signin') {
        replace = (store.state.reqPage && store.state.reqPage.name === 'policy') ? store.state.reqPage : router.resolve({ name: 'signin' }).route
      }
    } else if (!store.getters.isSignInMethod) {
      replace = { name: 'preferences' }
    } else if ([ 'signin' ].includes(to.name)) {
      replace = store.state.reqPage || router.resolve({ name: 'top' }).route
    } else if ([
      'accounts'
    ].includes(to.name) && (!store.getters.isManager)) {
      replace = router.resolve({ name: 'top' }).route
    } else if ([
      'service',
      'raw'
    ].includes(to.name) && (!store.getters.isAdmin)) {
      replace = router.resolve({ name: 'top' }).route
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
