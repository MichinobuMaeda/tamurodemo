<template>
  <v-app>
    <v-app-bar
      id="header"
      app
      color="theme1"
      dense
      hide-on-scroll
      elevation="0"
      @click="goPage({ name: 'top' })"
    >
      <img
        :style="`width: 40px; filter: brightness(${ this.$vuetify.theme.dark ? '300%' : '100%' });`"
        :src="baseUrl + 'img/icons/apple-touch-icon-120x120.png'"
        :alt="(state.service.conf && state.service.conf.name) || 'Tamuro'"
      />
      <v-toolbar-title
        class="theme1r--text text-h1 ml-2"
      >
        {{ (state.service.conf && state.service.conf.name) || 'Tamuro' }}
      </v-toolbar-title>
    </v-app-bar>

    <v-main v-if="state.loading">
      <Loading color="h2" :size="96" />
    </v-main>
    <v-main class="px-4" v-else>
      <div class="text-center">
        <DefaultButton
          v-if="noSignInMethod(state)"
          color="warning"
          :icon="icon('Sign in')"
          :label="$t('Set the sign-in method')"
          @click="goPage({ name: 'preferences' })"
        />
        <AppUpdater
          v-if="updateAvailable(state)"
          :label="$t('Update app')"
          :icon="icon('Update app')"
        />
        <AppInstaller
          v-if="state.me.valid"
          :icon="icon('Install app')"
          :label="$t('Install app')"
        />
      </div>
      <router-view />
    </v-main>

    <v-footer
      id="footer"
      color="theme1r--text"
      class="theme1"
      height="48px"
    >
      <span>Ver. {{ version }}</span>
    </v-footer>

    <Menu
      v-if="!state.loading"
      menu-color="menu"
      menu-item-color="menu-item"
      :menuItems="() => guardMenuItem(menuItems(state.me.id, myName, () => { page.rawData = true }), $router, priv, goPage)"
      :position="state.menuPosition"
      @move="menuPosition => state.me && state.me.valid && waitForUpdate('accounts', state.me.id, { menuPosition })"
    />

    <RawDataTree
      v-model="page.rawData"
      :icon="icon('Raw data')"
      :title="$t('Raw data')"
      icon-color="h2"
      title-color="h2--text"
      text-color="title--text"
      :items="{ ...state, currentUser: auth.currentUser }"
    />
  </v-app>
</template>

<style lang="scss">
@import 'styles/index.scss';
</style>

<script>
import { reactive, onMounted, watch, provide } from '@vue/composition-api'
import * as firebase from './plugins/firebase'
import { menuItems, baseUrl, version } from './conf'
import {
  createStore, initServiceData,
  overrideDefaults, StoreSymbol
} from './store'
import {
  getAuthState,
  updateInvitationStatus,
  detectPrivilegesChanged,
  detectAccountChanged,
  guardMenuItem,
  guardRoute,
  goPage,
  authProviders
} from './auth'
import {
  initializeMessaging
} from './store/io'
import Menu from './components/Menu'
import Loading from './components/Loading.vue'
import AppUpdater from './components/AppUpdater'
import AppInstaller from './components/AppInstaller'
import DefaultButton from './components/DefaultButton'
import RawDataTree from './components/RawDataTree'

export default {
  name: 'App',
  components: {
    Menu,
    Loading,
    AppUpdater,
    AppInstaller,
    DefaultButton,
    RawDataTree
  },
  setup (props, { root }) {
    const page = reactive({
      rawData: false,
      pwaDeferredPrompt: null
    })

    const store = provide(StoreSymbol, createStore(firebase, root))
    overrideDefaults(store, root)
    store.goPage = goPage(root.$router)
    store.goPageGroup = id => store.goPage({ name: 'group', params: { id } })
    store.goPageUser = (id, edit = false) => store.goPage({ name: 'user', params: { id, mode: (edit ? 'edit' : null) } })
    store.standalone = window.matchMedia('(display-mode: standalone)').matches

    onMounted(async () => {
      await getAuthState(store)
      await initServiceData(store)
      await updateInvitationStatus(store)
      await initializeMessaging(store)
    })

    watch(
      () => root.$route,
      () => {
        guardRoute(root.$router, root.$route, store.state)
      }
    )

    watch(
      () => store.state.service,
      () => {
        overrideDefaults(store, root)
        guardRoute(root.$router, root.$route, store.state)
      }
    )

    watch(
      () => store.state.groups,
      async (groups, groupsPrev) => {
        await detectPrivilegesChanged(store, groups, groupsPrev)
        guardRoute(root.$router, root.$route, store.state)
      }
    )

    watch(
      () => store.state.me,
      async (me, mePrev) => {
        overrideDefaults(store, root)
        await detectAccountChanged(store, root.$router, me, mePrev)
        guardRoute(root.$router, root.$route, store.state, store.state.loading)
      }
    )

    watch(
      () => store.state.loading,
      () => {
        guardRoute(root.$router, root.$route, store.state)
      }
    )

    return {
      ...store,
      page,
      guardMenuItem,
      menuItems,
      baseUrl: baseUrl(),
      noSignInMethod: state => state.me.valid && ![...authProviders(store).map(item => item.id), 'email'].some(key => state.me[key]),
      updateAvailable: state => state.service.conf && state.service.conf.version !== version,
      version
    }
  }
}
</script>
