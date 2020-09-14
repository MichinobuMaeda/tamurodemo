<template>
  <v-app>
    <v-app-bar
      app
      color="lime lighten-5"
      dense
      hide-on-scroll
      elevation="0"
      @click="goPage(state, $router, 'top')"
    >
      <img style="width: 40px;" src="img/icons/apple-touch-icon-120x120.png" alt="Sanno" />
      <v-toolbar-title
        class="lime--text text--darken-4 text-h5 ml-2"
      >
        Tamuro
      </v-toolbar-title>
    </v-app-bar>

    <v-main class="ma-3" v-if="state.loading">
      <Loading />
    </v-main>
    <v-main class="ma-3" v-else>
      <router-view />
    </v-main>

    <v-footer
      color="lime lighten-5 black--text"
      class="lime--text text--darken-4"
      height="48px"
    >
      <span>Ver.</span>
    </v-footer>

    <Menu />
  </v-app>
</template>

<script>
import Menu from './components/Menu'
import Loading from './components/Loading.vue'
import store from './plugins/composition-api'
import { onMounted } from '@vue/composition-api'

export default {
  name: 'App',
  components: {
    Menu,
    Loading
  },
  setup (/* props, context */) {
    store.provideStore(store)
    onMounted(async function () {
      await store.initService(store.state)
      await store.checkAuthStatus(store.state)
    })
    return store.useStore()
  }
}
</script>
