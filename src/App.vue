<template>
  <v-app>
    <v-app-bar
      app
      :color="state.color.headerBg"
      dense
      hide-on-scroll
      elevation="0"
      @click="goPage($router, { name: 'top' })"
    >
      <img style="width: 40px;" src="img/icons/apple-touch-icon-120x120.png" alt="Sanno" />
      <v-toolbar-title
        :class="state.color.headerText + ' text-h5 ml-2'"
      >
        Tamuro
      </v-toolbar-title>
    </v-app-bar>

    <v-main class="ma-3" v-if="state.loading">
      <Loading :color="state.color.theme1" />
    </v-main>
    <v-main class="ma-3" v-else>
      <router-view />
    </v-main>

    <v-footer
      :color="state.color.footerBg"
      :class="state.color.footerText"
      height="48px"
    >
      <span>Ver.</span>
    </v-footer>

    <Menu
      v-if="!state.loading"
      :menu-color="state.color.theme1"
      :menu-item-color="state.color.theme2"
      :menuItems="menuItems(state, $router)"
      :on-menu-moved="onMenuMoved(state)"
      :position="state.menuPosition"
    />
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
