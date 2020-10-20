<template>
  <v-app>
    <v-app-bar
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
      v-if="!state.loading"
      menu-color="menu"
      menu-item-color="menu-item"
      :menuItems="menuItems($router, priv, state.me.id, myName, goPage, showRawData)"
      :position="state.menuPosition"
      @move="pos => onMenuMoved(pos)"
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
import { reactive, onMounted, watch } from '@vue/composition-api'
import { createStore, initServiceData, initUserData, menuItems, overrideDefaults } from '@/store'
import { getAuthState, guard, signOut, accountIsValid, detectPrivilegesChanged } from '@/auth'
import { restoreRequestedRoute, baseUrl } from '@/utils'
import Menu from '@/components/Menu'
import Loading from '@/components/Loading.vue'
import AppUpdater from '@/components/AppUpdater'
import RawDataTree from '@/components/RawDataTree'

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
      rawData: false
    })

    const store = createStore(root)
    store.state.loading = true

    onMounted(async () => {
      await initServiceData(store, root)
      await getAuthState(store, { root })
    })

    watch(
      () => root.$route,
      () => {
        guard(root.$router, root.$route, store.state)
      }
    )

    watch(
      () => store.state.service,
      () => {
        overrideDefaults(store, root)
        guard(root.$router, root.$route, store.state)
      }
    )

    watch(
      () => store.state.groups,
      async (groups, groupsPrev) => {
        await detectPrivilegesChanged(store, root, groups, groupsPrev)
        guard(root.$router, root.$route, store.state)
      }
    )

    watch(
      () => store.state.me,
      async (me, mePrev) => {
        overrideDefaults(store, root)
        if ((!mePrev.id || accountIsValid(mePrev)) && !accountIsValid(me)) {
          await signOut(store)
        } else if (!accountIsValid(mePrev) && accountIsValid(me)) {
          await await initUserData(store, root)
          restoreRequestedRoute(root.$router)
        }
        guard(root.$router, root.$route, store.state, store.state.loading)
      }
    )

    watch(
      () => store.state.loading,
      () => {
        guard(root.$router, root.$route, store.state)
      }
    )

    const onMenuMoved = ({ db, state }) => async pos => {
      if (accountIsValid(state.me)) {
        await db.collection('accounts').doc(state.me.id).update({
          menuPosition: pos,
          updatedAt: new Date()
        })
      }
    }

    return {
      ...store,
      page,
      menuItems,
      onMenuMoved: onMenuMoved(store),
      showRawData: () => { page.rawData = true },
      baseUrl: baseUrl()
    }
  }
}
</script>
