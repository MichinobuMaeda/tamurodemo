<template>
  <v-app>
    <v-app-bar
      app
      color="theme1"
      dense
      hide-on-scroll
      elevation="0"
      @click="goPage($router, { name: 'top' })"
    >
      <img
        :style="`width: 40px; filter: brightness(${ this.$vuetify.theme.dark ? '300%' : '100%' });`"
        src="img/icons/apple-touch-icon-120x120.png"
        :alt="(state.service.conf && state.service.conf.name) || 'Tamuro'"
      />
      <v-toolbar-title
        class="theme1r--text text-h1 ml-2"
      >
        {{ (state.service.conf && state.service.conf.name) || 'Tamuro' }}
      </v-toolbar-title>
    </v-app-bar>

    <v-main class="ma-3" v-if="page.loading">
      <Loading color="h2" :size="96" />
    </v-main>
    <v-main class="ma-3" v-else>
      <AppUpdater
        v-if="state.service.conf && state.service.conf.version !== version"
        :label="$t('Update app')"
        :icon="icon('Update app')"
      />
      <router-view />
    </v-main>

    <v-footer
      color="theme1r--text"
      class="theme1"
      height="48px"
    >
      <span>Ver. {{ version }}</span>
    </v-footer>

    <Menu
      v-if="!page.loading"
      menu-color="menu"
      menu-item-color="menu-item"
      :menuItems="menuItems"
      :position="menuPosition"
      @move="pos => onMenuMoved(pos)"
    />

    <RawDataTree
      v-model="page.rawData"
      :icon="icon('Raw data')"
      :title="$t('Raw data')"
      icon-color="h2"
      title-color="h2--text"
      text-color="title--text"
      :items="state"
    />
  </v-app>
</template>

<style lang="scss">
@import 'styles/index.scss';
</style>

<script>
import { createStore, syncServiceData, syncUserData } from '@/init'
import { reactive, computed, onMounted, watchEffect } from '@vue/composition-api'
import menuItems from '@/router/menuItems'
import guard from '@/router/guard'
import version from '@/conf/version'
import * as helpers from '@/helpers'
import Menu from '@/components/Menu'
import Loading from '@/components/Loading.vue'
import AppUpdater from '@/components/AppUpdater'
import RawDataTree from '@/components/RawDataTree'

const { getMyPriv, getMyName } = helpers

export default {
  name: 'App',
  components: {
    Menu,
    Loading,
    AppUpdater,
    RawDataTree
  },
  setup (props, { root }) {
    const page = reactive({
      loading: true,
      rawData: false
    })

    const store = createStore()

    onMounted(async () => {
      await syncServiceData(store, root)
      await syncUserData(store, root, page)
    })

    watchEffect(() => {
      guard(root.$router, root.$route, getMyPriv(store.state))
    })

    const onMenuMoved = ({ db, state }) => async pos => {
      if (state.me && state.me.valid) {
        await db.collection('accounts').doc(state.me.id).update({
          menuPosition: pos,
          updatedAt: new Date()
        })
      }
    }

    return {
      ...store,
      page,
      menuItems: computed(() => menuItems(
        getMyPriv(store.state),
        getMyName(store.state),
        page,
        root.$router)
      ),
      onMenuMoved: onMenuMoved(store),
      version,
      ...helpers
    }
  }
}
</script>
