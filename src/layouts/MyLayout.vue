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
       <q-btn
        v-if="this.$route.path === '/' && isAdminOrManager"
        flat round dense :color="conf.styles.headerText" class="q-mr-sm"
        icon="edit"
        @click="openNameEditor"
      />
    </q-toolbar>
    <q-page-container>
      <router-view />
    </q-page-container>
    <div class="row">
      <div :class="'col q-pa-md bg-' + conf.styles.footerBg + ' text-' + conf.styles.footerText">
        Powerd by <a href="https://github.com/MichinobuMaeda/tamuro" target="_blank">Tamuro</a>
      </div>
    </div>
    <q-page-sticky :position="this.$store.state.menuPosition" :offset="[8, 8]">
      <q-fab
        icon="menu" :color="conf.styles.menuBg" :text-color="conf.styles.menuText"
        v-touch-swipe.mouse="handleSwipe"
        :direction="(this.$store.state.menuPosition === 'bottom-right' || this.$store.state.menuPosition === 'bottom-left') ? 'up' : 'down'"
        @show="showToolChip"
        @hide="hideToolChip"
      >
        <q-fab-action
          v-if="isValidAccount"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="home"
          to="/"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['home']">
            {{ $t('home') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-else
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="exit_to_app"
          to="/signin"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['signin']">
            {{ $t('signin') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="policy"
          to="/policy"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['policy']">
            {{ $t('privacyPolicy') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isValidAccount"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="settings_applications"
          to="/preferences"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['preferences']">
            {{ $t('preferences') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="cloud_circle"
          to="/service"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['service']">
            Serivce
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="memory"
          to="/raw"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['raw']">
            Raw data
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
    <q-dialog v-model="nameEditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="edit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('title') }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus type="text" v-model="name" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="primary" :label="$t('ok')" @click="saveName" :disable="(!name) || name === group('top').data().name" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MyLayout',
  data () {
    return {
      name: '',
      nameEditor: false,
      toolChip: {
        'home': false,
        'signin': false,
        'policy': false,
        'preferences': false,
        'service': false,
        'raw': false
      },
      toolChipTimer: null
    }
  },
  methods: {
    openNameEditor () {
      this.name = this.group('top').data().name
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
      if (this.$q.platform.is.mobile) {
        this.toolChipTimer = setTimeout(() => { Object.keys(this.toolChip).forEach(key => { this.toolChip[key] = true }) }, 1500)
      }
    },
    hideToolChip () {
      if (this.$q.platform.is.mobile) {
        if (this.toolChipTimer) {
          clearTimeout(this.toolChipTimer)
          this.toolChipTimer = null
        }
        Object.keys(this.toolChip).forEach(key => { this.toolChip[key] = false })
      }
    },
    async handleSwipe ({ evt, ...info }) {
      this.hideToolChip()
      if (this.$store.state.menuPosition === 'bottom-right') {
        if (info.direction === 'left') {
          this.$store.state.menuPosition = 'bottom-left'
        } else if (info.direction === 'up') {
          this.$store.state.menuPosition = 'top-right'
        }
      } else if (this.$store.state.menuPosition === 'top-right') {
        if (info.direction === 'left') {
          this.$store.state.menuPosition = 'top-left'
        } else if (info.direction === 'down') {
          this.$store.state.menuPosition = 'bottom-right'
        }
      } else if (this.$store.state.menuPosition === 'top-left') {
        if (info.direction === 'right') {
          this.$store.state.menuPosition = 'top-right'
        } else if (info.direction === 'down') {
          this.$store.state.menuPosition = 'bottom-left'
        }
      } else if (this.$store.state.menuPosition === 'bottom-left') {
        if (info.direction === 'right') {
          this.$store.state.menuPosition = 'bottom-right'
        } else if (info.direction === 'up') {
          this.$store.state.menuPosition = 'top-left'
        }
      }
      await this.$store.state.db.collection('accounts').doc(this.$store.state.me.id).update({
        menuPosition: this.$store.state.menuPosition
      })
      this.showToolChip()
    }
  },
  computed: {
    toolChipAnchor () { return this.$store.state.menuPosition.includes('left') ? 'center right' : 'center left' },
    toolChipSelf () { return this.$store.state.menuPosition.includes('left') ? 'center left' : 'center right' },
    ...mapGetters([
      'conf',
      'group',
      'isValidAccount',
      'isAdminOrManager',
      'isAdmin',
      'isManager'
    ])
  }
}
</script>
