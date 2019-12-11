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
        v-if="this.$route.name === 'top' && isAdminOrManager"
        flat round dense :color="conf.styles.headerText" class="q-mr-sm"
        icon="fas fa-edit"
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
        Powerd by <a href="https://github.com/MichinobuMaeda/tamuro" target="_blank">Tamuro</a>
        Ver. {{ $store.state.service.status ? $store.state.service.status.version : '' }}
      </div>
    </div>

    <q-page-sticky
      v-if="!$store.state.loading.length"
      :position="this.$store.state.menuPosition" :offset="[8, 8]"
    >
      <q-fab
        icon="fas fa-bars" :color="conf.styles.menuBg" :text-color="conf.styles.menuText"
        v-touch-swipe.mouse="handleSwipe"
        :direction="(this.$store.state.menuPosition === 'bottom-right' || this.$store.state.menuPosition === 'bottom-left') ? 'up' : 'down'"
        @show="showToolChip"
        @hide="hideToolChip"
      >
        <q-fab-action
          v-if="isValid"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-home"
          :to="{ name: 'top' }"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['home']">
            {{ $t('home') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-else
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-sign-in-alt"
          :to="{ name: 'signin' }"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['signin']">
            {{ $t('signin') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-shield-alt"
          :to="{ name: 'policy' }"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['policy']">
            {{ $t('privacyPolicy') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isValid"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-user-cog"
          :to="{ name: 'preferences' }"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['preferences']">
            {{ $t('preferences') }}
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-server"
          :to="{ name: 'service' }"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" v-model="toolChip['service']">
            Serivce
          </q-tooltip>
        </q-fab-action>
        <q-fab-action
          v-if="isAdmin"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" icon="fas fa-microchip"
          :to="{ name: 'raw' }"
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
          <q-avatar icon="fas fa-edit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('title') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
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
import { mapGetters } from 'vuex'
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
    goTop () {
      let to = this.isValid ? { name: 'top' } : { name: 'signin' }
      if (this.$route.name !== to.name) {
        if (this.isValid) {
          window.localStorage.setItem('reqPage', JSON.stringify(to))
        }
        this.$router.push(to).catch(() => {})
      }
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
      'isValid',
      'isAdminOrManager',
      'isAdmin',
      'isManager'
    ])
  }
}
</script>
