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
        @click="editName"
      />
      <Dialog ref="name" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
        <q-card-section>
          <q-input type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
        </q-card-section>
        <q-card-section align="right">
          <q-btn
            color="primary" no-caps :label="$t('save')"
            @click="saveName" :disable="!name || name === group('top').name"
          />
        </q-card-section>
      </Dialog>
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
          v-for="(item, index) in menuItems" v-bind:key="index"
          :color="conf.styles.menuItemBg" :text-color="conf.styles.menuItemText" :icon="item.icon"
          @click="item.onClick"
        >
          <q-tooltip :anchor="toolChipAnchor" :self="toolChipSelf" no-parent-event v-model="toolChip">
            {{ item.label }}
          </q-tooltip>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>

  </q-layout>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Loading from '../pages/Loading.vue'
import Dialog from '../components/Dialog'

export default {
  components: {
    Loading,
    Dialog
  },
  name: 'MyLayout',
  data () {
    return {
      name: '',
      nameRule: [ v => !!v || this.$t('required') ],
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
      return () => this.$router.push(next).catch(() => {})
    },
    editName () {
      this.name = this.group('top').name
      this.$refs.name.$refs.dialog.show()
    },
    async saveName () {
      this.$refs.name.$refs.dialog.hide()
      await this.$store.state.db.collection('groups').doc('top').update({
        name: this.name ? this.name.trim() : '',
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
        if (this.me && this.me.id) {
          await this.$store.state.db.collection('accounts').doc(this.me.id).update({ menuPosition })
        }
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
    menuItems () {
      return this.isValid ? [
        {
          icon: this.conf.styles.iconTop,
          label: this.$t('home'),
          onClick: this.goTop
        },
        {
          icon: this.conf.styles.iconPrivacyPolicy,
          label: this.$t('privacyPolicy'),
          onClick: this.goPage({ name: 'policy' })
        },
        {
          icon: this.conf.styles.iconPreferences,
          label: this.$t('preferences', { name: this.user(this.me.id).name }),
          onClick: this.goPage({ name: 'preferences' })
        },
        {
          icon: this.conf.styles.iconService,
          label: 'Service',
          onClick: this.goPage({ name: 'service' })
        },
        {
          icon: this.conf.styles.iconRawData,
          label: 'Raw data',
          onClick: this.goPage({ name: 'raw' })
        }
      ] : [
        {
          icon: this.conf.styles.iconSignIn,
          label: this.$t('signin'),
          onClick: this.goTop
        },
        {
          icon: this.conf.styles.iconPrivacyPolicy,
          label: this.$t('privacyPolicy'),
          onClick: this.goPage({ name: 'policy' })
        }
      ]
    },
    toolChipAnchor () { return this.menuPosition.includes('left') ? 'center right' : 'center left' },
    toolChipSelf () { return this.menuPosition.includes('left') ? 'center left' : 'center right' },
    ...mapGetters([
      'conf',
      'menuPosition',
      'me',
      'user',
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
