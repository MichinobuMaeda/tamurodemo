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
      :menuItems="menuItems(state.me.id, myName, priv, routePermission($router, priv), goPage, showRawData)"
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
import * as firebase from '@/plugins/firebase'
import { menuItems, baseUrl, version } from '@/conf'
import {
  createStore, initServiceData, initUserData,
  overrideDefaults, restoreRequestedRoute,
  accountIsValid, detectPrivilegesChanged, myPriv
} from '@/store'
import {
  getAuthState, signOut,
  updateInvitationStatus
} from '@/auth'
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

    const store = createStore(firebase, root)

    onMounted(async () => {
      await getAuthState(store)
      await initServiceData(store)
      await updateInvitationStatus(store)
    })

    const routePermission = (router, priv, route) => {
      return Object.keys(priv).some(
        key => priv[key] && route.matched.some(
          record => record.meta.privs.includes(key)
        )
      )
    }

    const guard = (router, route, state) => {
      const priv = myPriv(state)
      if (state.loading || !route || !route.name || routePermission(router, priv, route)) {
        // to do nothing
      } else {
        const compareRoutes = (r1, r2) => r1.name === r2.name &&
          !Object.keys(r1.params || {}).some(
            key => (r1.params || {})[key] !== (r2.params || {})[key]
          )
        const target = priv.user ? { name: 'top' } : { name: 'signin' }
        if (!compareRoutes(target, route)) {
          router.push(target).catch(() => {})
        }
      }
    }

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
        await detectPrivilegesChanged(store, groups, groupsPrev)
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
          await initUserData(store)
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
      routePermission: (router, priv) => route => routePermission(router, priv, router.match(route)),
      menuItems,
      onMenuMoved: onMenuMoved(store),
      showRawData: () => { page.rawData = true },
      baseUrl: baseUrl(),
      version
    }
  }
}
</script>
