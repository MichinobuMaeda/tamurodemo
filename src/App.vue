<template>
  <v-app>
    <v-app-bar
      app
      :color="color.headerBg"
      dense
      hide-on-scroll
      elevation="0"
      @click="goPage($router, { name: 'top' })"
    >
      <img style="width: 40px;" src="img/icons/apple-touch-icon-120x120.png" alt="Sanno" />
      <v-toolbar-title
        :class="color.headerText + ' text-h5 ml-2'"
      >
        {{ (state.service.conf && state.service.conf.name) || 'Tamuro' }}
      </v-toolbar-title>
    </v-app-bar>

    <v-main class="ma-3" v-if="page.loading">
      <Loading :color="color.theme1" :size="96" />
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
      :color="color.footerBg"
      :class="color.footerText"
      height="48px"
    >
      <span>Ver. {{ version }}</span>
    </v-footer>

    <Menu
      v-if="!page.loading"
      :menu-color="color.theme1"
      :menu-item-color="color.theme2"
      :menuItems="menuItems"
      v-model="state.menuPosition"
      @move="pos => onMenuMoved(pos)"
    />

    <RawDataTree
      v-model="page.rawData"
      :icon="icon('Raw data')"
      :title="$t('Raw data')"
      :icon-color="color.pageIcon"
      :title-color="color.pageTitle"
      :text-color="color.pageTitle"
      :items="state"
    />
  </v-app>
</template>

<style lang="scss">
@import 'sass/index.scss';
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
      await syncServiceData(store)
      await syncUserData(store, page)
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
