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
      <v-spacer />
      <v-toolbar-title
        class="theme1r--text text-h1 ml-2"
      >
        {{ (state.service.conf && state.service.conf.name) }}
      </v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-main v-if="showLoading">
      <Loading
        color="h2"
        :size="96"
        :message="`${$t('Please wait')} ${$t('If you wait more than x min', { min: 3 })}`"
      />
    </v-main>
    <v-main class="px-4" v-else>
      <v-alert
        v-if="page.oAuthMessage"
        dense outlined
        :type="page.result.type"
      >
        {{ $t('OAuth Error', page.oAuthMessage.params) }}
      </v-alert>
      <div class="text-center">
        <AppUpdater
          v-if="state.service.conf && state.service.conf.version !== conf.version"
          :label="$t('Update app')"
          :icon="conf.icon('Update app')"
        />
        <DefaultButton
          v-if="noSignInMethod(state) && state.invitations[state.me.id] && $route.name !== 'invitation'"
          color="warning"
          :icon="conf.icon('Sign in')"
          :label="$t('Set the sign-in method')"
          @click="goPage({ name: 'invitation', params: { invitation: state.invitations[state.me.id] }})"
        />
        <AppInstaller
          v-else-if="me && me.valid && !me.rejectAppInstall"
          :icon="conf.icon('Install app')"
          :iconCancel="conf.icon('Cancel')"
          :label="$t('You can install the app')"
          :descOk="$t('Install app')"
          :descCancel="$t('Reject to install app')"
          @cancel="() => waitFor(() => update(me, { rejectAppInstall: new Date() }))"
        />
      </div>
      <router-view />
    </v-main>

    <v-footer
      id="footer"
      color="theme1r--text"
      class="theme1 mt-2"
      height="48px"
    >
      <v-spacer />
      <span>Ver. {{ conf.version }}</span>
      <v-spacer />
    </v-footer>

    <Menu
      v-if="!showLoading"
      menu-color="menu"
      menu-item-color="menu-item"
      :menu-image="`${conf.baseUrl()}img/icons/emblem.png`"
      :menuItems="() => menuItems(me, $router)"
      :position="state.menuPosition"
      @move="onMenuMoved"
    />

    <RawDataTree
      v-model="page.rawData"
      :icon="conf.icon('Raw data')"
      :title="$t('Raw data')"
      icon-color="h2"
      title-color="h2--text"
      text-color="title--text"
      :items="{ conf, state }"
    />
  </v-app>
</template>

<style lang="scss">
@import 'styles/index.scss';
</style>

<script>
import { reactive, computed, onMounted, watch, provide } from '@vue/composition-api'
import * as firebase from './plugins/firebase'
import {
  createStore,
  initUserData,
  clearUserData,
  initServiceData,
  overrideDefaults,
  StoreSymbol,
  isValidAccount,
  initializeMessaging,
  subscribeGroupChats,
  subscribeHotlines,
  requestImageUrl,
  getImageUrl
} from './store'
import {
  getAuthState,
  updateInvitationStatus,
  detectPrivilegesChanged,
  guardMenuItem,
  guardRoute,
  goPage,
  authProviders,
  returnLastRoute,
  signOut,
  getOAuthMessage
} from './auth'
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
      oAuthMessage: ''
    })

    const store = createStore(firebase, root)
    provide(StoreSymbol, store)
    overrideDefaults(store, root)
    store.goPage = goPage(store.state, root.$router)
    store.goPageGroup = id => store.goPage({ name: 'group', params: { id } })
    store.goPageUser = (id, edit = false) => store.goPage({ name: 'user', params: { id, mode: (edit ? 'edit' : null) } })
    store.standalone = window.matchMedia('(display-mode: standalone)').matches
    const { state, update, conf, account, user, profile, getProfile } = store

    const showLoading = computed(() => state.loading || (state.me && state.me.id && (root.$route.name === 'signin' || !state.users.length)))

    onMounted(async () => {
      page.oAuthMessage = getOAuthMessage()
      await initServiceData(store)
      await getAuthState(store)
    })

    const avoidEmptyValue = route => {
      if (!showLoading.value) {
        if (route.name === 'user' && !state.users.some(item => item.id === route.params.id)) {
          root.$router.push({ name: 'top' }).catch(() => {})
        }
        if (route.name === 'group' && !state.groups.some(item => item.id === route.params.id)) {
          root.$router.push({ name: 'top' }).catch(() => {})
        }
      }
    }

    const onProfiePage = async () => {
      const { name, params } = state.route
      if (
        isValidAccount(state.me) &&
        !state.loading &&
        name === 'user' &&
        !(params.id === state.me.id || account(state.me.id).priv.manager) &&
        user(params.id).id &&
        !profile(params.id).id
      ) {
        state.loading = true
        await getProfile(params.id)
        state.loading = false
      }
    }

    watch(
      () => root.$route,
      async route => {
        if (guardRoute(root.$router, route, state)) {
          avoidEmptyValue(root.$route)
          const { name, params } = route
          state.route = { name, params }
          await onProfiePage()
        }
      }
    )

    watch(
      () => state.service,
      () => {
        overrideDefaults(store, root)
        guardRoute(root.$router, root.$route, state)
      }
    )

    watch(
      () => state.groups,
      async (groups, groupsPrev) => {
        if (detectPrivilegesChanged(state.me, groups, groupsPrev)) {
          await initUserData(store)
        }
        guardRoute(root.$router, root.$route, state)
        avoidEmptyValue(root.$route)
        subscribeGroupChats(store)
      }
    )

    watch(
      () => state.accounts,
      async () => {
        subscribeHotlines(store)
        avoidEmptyValue(root.$route)
      }
    )

    watch(
      () => state.users,
      async () => {
        if (isValidAccount(state.me) && !account(state.me.id).priv.manager) {
          if (state.profiles.some(profile => !user(profile.id).id)) {
            state.profiles = state.profiles.filter(profile => user(profile.id).id)
          }
          if (state.profiles.some(profile => profile.id !== state.me.id && user(profile.id).updatedAt.getTime() > profile.updatedAt.getTime())) {
            await Promise.all(
              state.profiles
                .filter(profile => profile.id !== state.me.id && user(profile.id).updatedAt.getTime() > profile.updatedAt.getTime())
                .map(profile => getProfile(profile.id))
            )
          }
        }
      }
    )

    watch(
      () => state.me,
      async (me, mePrev) => {
        overrideDefaults(store, root)
        if (mePrev.id !== me.id || mePrev.valid !== me.valid || (!!mePrev.deletedAt) !== (!!me.deletedAt)) {
          if (isValidAccount(me)) {
            await initUserData(store)
            await updateInvitationStatus(store)
            returnLastRoute(root.$router)
            await initializeMessaging(store)
          } else {
            clearUserData(state)
            await signOut(store)
          }
        }
        guardRoute(root.$router, root.$route, state)
        avoidEmptyValue(root.$route)
      }
    )

    watch(
      () => state.groupChats,
      messages => {
        requestImageUrl(state, messages)
      }
    )

    watch(
      () => state.hotlines,
      messages => {
        requestImageUrl(state, messages)
      }
    )

    watch(
      () => state.images,
      async () => {
        await getImageUrl(store)
      }
    )

    watch(
      () => state.loading,
      async () => {
        guardRoute(root.$router, root.$route, state)
        avoidEmptyValue(root.$route)
        await onProfiePage()
      }
    )

    return {
      ...store,
      page,
      showLoading,
      guardMenuItem,
      noSignInMethod: state => state.me.valid && ![...authProviders(store).map(item => item.id), 'email'].some(key => state.me[key]),
      menuItems: (me, router) => guardMenuItem(
        conf.menuItems(me.id,
          me.name,
          me.hidePrivilegedItems,
          () => update(state.me, { hidePrivilegedItems: !state.me.hidePrivilegedItems }),
          () => { page.rawData = true }
        ),
        router,
        me.priv,
        store.goPage
      ),
      onMenuMoved: async menuPosition => {
        if (state.me && state.me.valid) {
          await update(state.me, { menuPosition })
        } else {
          state.menuPosition = menuPosition
        }
      }
    }
  }
}
</script>
