<template>
  <q-layout view="lHh Lpr lFf">
    <q-toolbar :class="'bg-' + conf.styles.headerBg">
      <q-avatar rounded @click="goTop">
        <img src="statics/app-logo-128x128.png">
      </q-avatar>
      <q-toolbar-title :class="'text-' + conf.styles.headerText" @click="goTop">
        {{ group('top') && group('top').name }}
      </q-toolbar-title>
      <q-btn
        v-if="this.$route.name === 'top' && isManager"
        flat round dense :color="conf.styles.headerText" class="q-mr-sm"
        :icon="conf.styles.iconEdit"
        @click="openNameEditor"
      />
    </q-toolbar>

    <q-page-container v-if="$store.state.loading.length">
      <Loading />
    </q-page-container>
    <q-page-container v-else>
      <router-view />
    </q-page-container>

    <div class="row">
      <div :class="'col q-pa-md bg-' + conf.styles.footerBg + ' text-' + conf.styles.footerText">
        <a href="https://github.com/MichinobuMaeda/tamuro" target="_blank">Tamuro</a>
        Ver. {{ $store.state.conf.version }}
      </div>
    </div>

    <q-page-sticky
      v-if="!$store.state.loading.length"
      :position="menuPosition" :offset="[8, 8]"
    >
      <q-fab
        ref="menu"
        :icon="conf.styles.iconMenu" :color="conf.styles.menuBg" :text-color="conf.styles.menuText"
        v-touch-swipe.mouse="handleSwipe"
        :direction="menuPosition.includes('bottom') ? 'up' : 'down'"
        @show="showToolChip"
        @hide="hideToolChip"
      >
        <q-fab-action
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" :icon="isValid ? 'fas fa-home' : 'fas fa-sign-in-alt'"
          @click="goTop"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" no-parent-event v-model="toolChip">
            {{ $t(isValid ? 'home': 'signin') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-shield-alt"
          @click="goPage({ name: 'policy' })"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" no-parent-event v-model="toolChip">
            {{ $t('privacyPolicy') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isValid"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-user-cog"
          @click="goPage({ name: 'preferences' })"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" no-parent-event v-model="toolChip">
            {{ $t('preferences') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-server"
          @click="goPage({ name: 'service' })"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" no-parent-event v-model="toolChip">
            Serivce
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-microchip"
          @click="goPage({ name: 'raw' })"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" no-parent-event v-model="toolChip">
            Raw data
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>

    <q-dialog v-model="nameEditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar :icon="conf.styles.iconEdit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('title') }}</span>
          <q-space />
          <q-btn :icon="conf.styles.iconClose" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus type="text" v-model="name" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="primary" :label="$t('ok')" @click="saveName" :disable="(!name) || name === group('top').name" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Loading from '../pages/Loading.vue'

export default {
  components: {
    Loading
  },
  name: 'MyLayout',
  data () {
    return {
      name: '',
      nameEditor: false,
      toolChip: false,
      toolChipTimer: null
    }
  },
  watch: {
    async 'meState' (newValue, oldValue) {
      this.hideToolChip()
    }
  },
  methods: {
    goTop () {
      let next = this.isValid ? { name: 'top' } : { name: 'signin' }
      if (this.$route.name !== next.name) {
        if (this.isValid) {
          window.localStorage.setItem('reqPage', JSON.stringify(next))
        }
        this.$router.push(next).catch(() => {})
      }
    },
    goPage (next) {
      this.$router.push(next).catch(() => {})
    },
    openNameEditor () {
      this.name = this.group('top').name
      this.nameEditor = true
    },
    async saveName () {
      this.nameEditor = false
      await this.$store.state.db.collection('groups').doc('top').update({
        name: this.name,
        updatedAt: new Date()
      })
    },
    showToolChip () {
      this.toolChip = false
      this.toolChipTimer = setTimeout(() => { this.toolChip = true }, 500)
    },
    hideToolChip () {
      if (this.toolChipTimer) {
        clearTimeout(this.toolChipTimer)
        this.toolChipTimer = null
      }
      this.toolChip = false
    },
    async handleSwipe ({ evt, ...info }) {
      this.hideToolChip()
      this.$refs.menu.hide()
      let currPosition = this.menuPosition
      const setMenuPosition = async menuPosition => {
        this.$store.state.preferences.menuPosition = menuPosition
        await this.$store.state.db.collection('accounts').doc(this.me.id).update({ menuPosition })
      }
      if (currPosition === 'bottom-right' && info.direction === 'left') {
        await setMenuPosition('bottom-left')
      } else if (currPosition === 'bottom-right' && info.direction === 'up') {
        await setMenuPosition('top-right')
      } else if (currPosition === 'top-right' && info.direction === 'left') {
        await setMenuPosition('top-left')
      } else if (currPosition === 'top-right' && info.direction === 'down') {
        await setMenuPosition('bottom-right')
      } else if (currPosition === 'top-left' && info.direction === 'right') {
        await setMenuPosition('top-right')
      } else if (currPosition === 'top-left' && info.direction === 'down') {
        await setMenuPosition('bottom-left')
      } else if (currPosition === 'bottom-left' && info.direction === 'right') {
        await setMenuPosition('bottom-right')
      } else if (currPosition === 'bottom-left' && info.direction === 'up') {
        await setMenuPosition('top-left')
      }
    }
  },
  computed: {
    toolChipAnchor () { return this.menuPosition.includes('left') ? 'center right' : 'center left' },
    toolChipSelf () { return this.menuPosition.includes('left') ? 'center left' : 'center right' },
    ...mapGetters([
      'conf',
      'menuPosition',
      'me',
      'group',
      'isValid',
      'isAdminOrManager',
      'isAdmin',
      'isManager'
    ]),
    ...mapState({
      meState: 'me'
    })
  }
}
</script>
