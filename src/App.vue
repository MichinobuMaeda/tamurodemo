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
      <Loading :color="state.color.theme1" :size="96" />
    </v-main>
    <v-main class="ma-3" v-else>
      <AppUpdater
        v-if="state.service.conf && state.service.conf.version !== state.version"
        color="orange darken-4"
        :label="$t('Update app')"
        :icon="icon('Update app')"
      />
      <router-view />
    </v-main>

    <v-footer
      :color="state.color.footerBg"
      :class="state.color.footerText"
      height="48px"
    >
      <span>Ver. {{ state.version }}</span>
    </v-footer>

    <Menu
      v-if="!state.loading"
      :menu-color="state.color.theme1"
      :menu-item-color="state.color.theme2"
      :menuItems="menuItems(state, $router)"
      v-model="state.menuPosition"
      @move="pos => onMenuMoved(state, pos)"
    />

    <RawDataTree
      v-model="state.rawData"
      :icon="icon('Raw data')"
      :title="$t('Raw data')"
      :icon-color="state.color.pageIcon"
      :title-color="state.color.pageTitle"
      :text-color="state.color.pageTitle"
      :items="state"
    />

  </v-app>
</template>

<style lang="scss">
@import 'sass/index.scss';
</style>

<script>
import Menu from './components/Menu'
import Loading from './components/Loading.vue'
import AppUpdater from './components/AppUpdater'
import RawDataTree from './components/RawDataTree'
import { initStore, useStore } from './plugins/composition-api'
import { onMounted, watchEffect } from '@vue/composition-api'
import guard from './router/guard'

export default {
  name: 'App',
  components: {
    Menu,
    Loading,
    AppUpdater,
    RawDataTree
  },
  setup (props, context) {
    const store = initStore()
    onMounted(async () => {
      await store.initService(store.state)
      await store.checkAuthStatus(store.state)
    })
    watchEffect(() => {
      guard(context.root.$router, context.root.$route, store.state)
    })
    return useStore()
  }
}
</script>
