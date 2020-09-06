<template>
  <v-app>
    <v-app-bar
      app
      color="light-blue lighten-5"
      dense
      hide-on-scroll
      elevation="0"
      @click="goPage(state, $router, 'top')"
    >
      <img style="width: 40px;" src="img/icons/apple-touch-icon-120x120.png" alt="Sanno" />
      <v-toolbar-title
        class="light-blue--text text--darken-4 text-h5 ml-2"
      >
        Tamuro
      </v-toolbar-title>
    </v-app-bar>

    <v-main class="ma-3" v-if="!(state.service.status && state.service.status.version)">
      <Loading />
    </v-main>
    <v-main class="ma-3" v-else>
      <router-view />
    </v-main>

    <v-footer
      color="light-blue lighten-5 black--text"
      class="light-blue--text text--darken-4"
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
// import store from './plugins/composition-api'
// import { onMounted } from '@vue/composition-api'

export default {
  name: 'App',
  components: {
    Menu,
    Loading
  },
  setup (/* props, context */) {
    // 保持データのストアを供給する。
    store.provideStore(store)
    // onMounted(async function () {
    //   // サービスの状態を取得する。
    //   await store.initCommonService(store.state)
    //   // 保存されているステータスメッセージを取得する。
    //   store.state.authMessage = window.localStorage.getItem('spacemoniAuthMessage') || ''
    //   // 初期データを取得する。
    //   await store.initStore(store.state)
    // })
    // 保持データのストアを使用する。
    const rootStore = store.useStore()
    return rootStore
  }
}
</script>
