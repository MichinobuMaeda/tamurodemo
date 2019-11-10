<template>
  <q-layout view="lHh Lpr lFf">
    <q-toolbar :class="'bg-' + conf.styles.headerBg">
      <router-link to="/">
        <q-avatar rounded>
          <img src="statics/app-logo-128x128.png">
        </q-avatar>
      </router-link>
      <q-toolbar-title :class="'text-' + conf.styles.headerText">
        {{ group('top') && group('top').data().name }}
      </q-toolbar-title>
    </q-toolbar>
    <q-page-container>
      <router-view />
    </q-page-container>
    <div class="row">
      <div :class="'col q-pa-md bg-' + conf.styles.footerBg + ' text-' + conf.styles.footerText">
        Powerd by <a href="https://github.com/MichinobuMaeda/tamuro" target="_blank">Tamuro</a>
      </div>
    </div>
    <q-page-sticky :position="menuPosition" :offset="[8, 8]">
      <q-fab
        icon="menu" :color="conf.styles.menuBg" :text-color="conf.styles.menuText"
        v-touch-swipe.mouse="handleSwipe"
        :direction="(menuPosition === 'bottom-right' || menuPosition === 'bottom-left') ? 'up' : 'down'"
        @show="showToolChip"
        @hide="hideToolChip"
      >
        <q-fab-action
          v-if="isValidAccount"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="home"
          to="/"
        >
          <q-tooltip anchor="center left" self="center right" v-model="toolChip">
            {{ $t('home') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-else
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="exit_to_app"
          to="/signin"
        >
          <q-tooltip anchor="center left" self="center right" v-model="toolChip">
            {{ $t('signin') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="policy"
          to="/policy"
        >
          <q-tooltip anchor="center left" self="center right" v-model="toolChip">
            {{ $t('privacyPolicy') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isValidAccount"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="settings_applications"
          to="/preferences"
        >
          <q-tooltip anchor="center left" self="center right" v-model="toolChip">
            {{ $t('preferences') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="cloud_circle"
          to="/service"
        >
          <q-tooltip anchor="center left" self="center right" v-model="toolChip">
            Serivce
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="memory"
          to="/raw"
        >
          <q-tooltip anchor="center left" self="center right" v-model="toolChip">
            Raw data
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MyLayout',
  data () {
    return {
      menuPosition: 'bottom-right',
      toolChip: false,
      toolChipTimer: null
    }
  },
  methods: {
    showToolChip () {
      this.toolChipTimer = setTimeout(() => { this.toolChip = true }, 1500)
    },
    hideToolChip () {
      if (this.toolChipTimer) {
        clearTimeout(this.toolChipTimer)
        this.toolChipTimer = null
      }
      this.toolChip = false
    },
    handleSwipe ({ evt, ...info }) {
      this.toolChip = false
      if (this.menuPosition === 'bottom-right') {
        if (info.direction === 'left') {
          this.menuPosition = 'bottom-left'
        } else if (info.direction === 'up') {
          this.menuPosition = 'top-right'
        }
      } else if (this.menuPosition === 'top-right') {
        if (info.direction === 'left') {
          this.menuPosition = 'top-left'
        } else if (info.direction === 'down') {
          this.menuPosition = 'bottom-right'
        }
      } else if (this.menuPosition === 'top-left') {
        if (info.direction === 'right') {
          this.menuPosition = 'top-right'
        } else if (info.direction === 'down') {
          this.menuPosition = 'bottom-left'
        }
      } else if (this.menuPosition === 'bottom-left') {
        if (info.direction === 'right') {
          this.menuPosition = 'bottom-right'
        } else if (info.direction === 'up') {
          this.menuPosition = 'top-left'
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'group',
      'isValidAccount',
      'isAdmin',
      'isManager'
    ])
  }
}
</script>
