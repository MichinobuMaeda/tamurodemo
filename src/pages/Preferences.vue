<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-8 col-md-6 col-lg-4 col-xl-4 q-pa-sm">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconPreferences" />
        {{ $t('preferences', { name: user(me.id).name }) }}
      </p>

      <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
      <q-separator class="q-my-md" />
      <div class="q-my-md">{{ $t('signInMethod') }}</div>

      <q-btn
        v-if="conf.auth.line && isLine"
        class="q-my-md full-width" align="left" outline color="green"
        icon="fab fa-line" :label="$t('removeProvider', { provider: 'LINE' })"
        @click="unlinkProvider({ provider: conf.auth.line })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconRemove" />
      </q-btn>
      <q-btn
        v-else-if="conf.auth.line"
        class="q-my-md full-width" align="left" outline color="green"
        icon="fab fa-line" :label="$t('addProvider', { provider: 'LINE' })"
        @click="linkProvider({ provider: conf.auth.line })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconAdd" />
      </q-btn>

      <q-btn
        v-if="conf.auth.facebook && isFacebook"
        class="q-my-md full-width" align="left" outline color="blue-10"
        :icon="conf.styles.iconRemove" :label="$t('removeProvider', { provider: 'Facebook' })"
        @click="unlinkProvider({ provider: conf.auth.facebook })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconRemove" />
      </q-btn>
      <q-btn
        v-else-if="conf.auth.facebook"
        class="q-my-md full-width" align="left" outline color="blue-10"
        :icon="conf.styles.iconAdd" :label="$t('addProvider', { provider: 'Facebook' })"
        @click="linkProvider({ provider: conf.auth.facebook })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconAdd" />
      </q-btn>

      <q-btn
        v-if="conf.auth.github && isGithub"
        class="q-my-md full-width" align="left" outline color="black"
        :icon="conf.styles.iconRemove" :label="$t('removeProvider', { provider: 'GitHub' })"
        @click="unlinkProvider({ provider: conf.auth.github })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconRemove" />
      </q-btn>
      <q-btn
        v-else-if="conf.auth.github"
        class="q-my-md full-width" align="left" outline color="black"
        :icon="conf.styles.iconAdd" :label="$t('addProvider', { provider: 'GitHub' })"
        @click="linkProvider({ provider: conf.auth.github })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconAdd" />
      </q-btn>

      <q-btn
        v-if="conf.auth.google && isGoogle"
        class="q-my-md full-width" align="left" outline color="red-10"
        :icon="conf.styles.iconRemove" :label="$t('removeProvider', { provider: 'Google' })"
        @click="unlinkProvider({ provider: conf.auth.google })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconRemove" />
      </q-btn>
      <q-btn
        v-else-if="conf.auth.google"
        class="q-my-md full-width" align="left" outline color="red-10"
        :icon="conf.styles.iconAdd" :label="$t('addProvider', { provider: 'Google' })"
        @click="linkProvider({ provider: conf.auth.google })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconAdd" />
      </q-btn>

      <q-btn
        v-if="conf.auth.twitter && isTwitter"
        class="q-my-md full-width" align="left" outline color="light-blue"
        icon="fab fa-twitter" :label="$t('removeProvider', { provider: 'Twitter' })"
        @click="unlinkProvider({ provider: conf.auth.twitter })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconRemove" />
      </q-btn>
      <q-btn
        v-else-if="conf.auth.twitter"
        class="q-my-md full-width" align="left" outline color="light-blue"
        icon="fab fa-twitter" :label="$t('addProvider', { provider: 'Twitter' })"
        @click="linkProvider({ provider: conf.auth.twitter })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconAdd" />
      </q-btn>

      <div v-if="(conf.auth.emailLink || conf.auth.password) && isEmail">
        <q-separator class="q-my-md" />
        <div>{{ $t('emailAddressSaved') }}</div>
        <div>{{ currentUser && currentUser.email }}</div>
        <q-btn
          v-if="conf.auth.password"
          class="q-my-md full-width" align="left" outline color="brown"
          icon="fas fa-key" :label="$t('resetPassword')"
          @click="sendPasswordResetEmail(currentUser.email)"
        >
          <q-space />
          <q-icon name="fas fa-reply" />
        </q-btn>
      </div>
      <div v-else-if="conf.auth.emailLink || conf.auth.password">
        <q-separator class="q-my-md" />
        <q-input v-model="email" type="email" :rules="emailRule" :label="$t('emailAddress')">
          <template v-slot:before>
            <q-icon name="far fa-envelope" />
          </template>
        </q-input>
        <q-btn
          class="full-width" align="left" outline color="brown"
          :icon="conf.styles.iconAdd" :label="$t('addProvider', { provider: $t('emailAddress') })"
          :disable="(!email) || (!conf.validators.email(email))"
          @click="linkProvider({ provider: conf.auth.emailLink, email })"
        />
      </div>

    </div>
    <div class="col col-xs-12 col-sm-8 col-md-6 col-lg-4 col-xl-4 q-pa-sm">

      <div class="q-py-sm">
        <q-btn
          color="primary" outline no-caps
          :icon="conf.styles.iconUser" :label="$t('editName')"
          @click="editName"
        />
      </div>
      <div class="q-py-sm">
        <q-btn
          color="primary" outline no-caps
          :icon="conf.styles.iconMenu" :label="$t('menuPosition') + ': ' + currMenuPosition.label"
          @click="editMenuPosition"
        />
      </div>
      <div class="q-py-sm">
        <q-btn
          color="primary" outline no-caps
          :icon="conf.styles.iconTimezone" :label="$t('timezone') + ': ' + me.timezone"
          @click="editTimezone"
        />
      </div>
      <div class="q-py-sm">
        <q-btn
          color="primary" outline no-caps
          :icon="conf.styles.iconLocale" :label="$t('locale') + ': ' + currLocale.label"
          @click="editLocale"
        />
      </div>
      <p>
        <q-btn
          class="q-my-md"
          outline color="negative"
          icon="fas fa-sign-out-alt" :label="$t('signout')"
          @click="signOut" />
      </p>
    </div>

    <Dialog
      ref="name"
      v-bind:icon="conf.styles.iconEdit"
      v-bind:title="$t('edit')"
    >
      <q-card-section>
        <q-input class="text-h6" type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
      </q-card-section>
      <q-card-section class="row items-center">
        <q-space />
        <q-btn
          color="primary" no-caps
          :label="$t('save')" @click="saveName"
          :disable="!name || name === user(me.id).name"
        />
      </q-card-section>
    </Dialog>

    <Dialog
      ref="menuPosition"
      v-bind:icon="conf.styles.iconEdit"
      v-bind:title="$t('edit')"
    >
      <q-card-section>
        <q-select
          class="text-h6"
          v-model="menuPosition"
          :options="conf.styles.menuPositions"
        >
          <template v-slot:before>
            {{ $t('menuPosition') }}
          </template>
        </q-select>
      </q-card-section>
      <q-card-section class="row items-center">
        <q-space />
        <q-btn
          color="primary" no-caps
          :label="$t('save')" @click="saveMenuPosition"
          :disable="menuPosition.value === me.menuPosition"
        />
      </q-card-section>
    </Dialog>

    <Dialog
      ref="timezone"
      v-bind:icon="conf.styles.iconEdit"
      v-bind:title="$t('edit')"
    >
      <q-card-section>
        <q-select
          class="text-h6"
          v-model="timezone"
          :options="conf.locales.timezones"
        >
          <template v-slot:before>
            {{ $t('timezone') }}
          </template>
        </q-select>
      </q-card-section>
      <q-card-section class="row items-center">
        <q-space />
        <q-btn
          color="primary" no-caps
          :label="$t('save')" @click="saveTimezone"
          :disable="timezone === me.timezone"
        />
      </q-card-section>
    </Dialog>

    <Dialog
      ref="locale"
      v-bind:icon="conf.styles.iconEdit"
      v-bind:title="$t('edit')"
    >
      <q-card-section>
        <q-select
          class="text-h6"
          v-model="locale"
          :options="conf.locales.locales"
        >
          <template v-slot:before>
            {{ $t('locale') }}
          </template>
        </q-select>
      </q-card-section>
      <q-card-section class="row items-center">
        <q-space />
        <q-btn
          color="primary" no-caps
          :label="$t('save')" @click="saveLocale"
          :disable="locale === me.locale"
        />
      </q-card-section>
    </Dialog>

  </q-page>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'
import Dialog from '../components/Dialog'

export default {
  name: 'PagePreferences',
  components: {
    Dialog
  },
  data () {
    return {
      email: '',
      isPwd: true,
      emailRule: [ v => (!v || this.conf.validators.email(v)) || this.$t('invalidEmailAddress') ],
      name: '',
      nameRule: [ v => !!v || this.$t('required') ],
      menuPosition: '',
      timezone: '',
      locale: ''
    }
  },
  methods: {
    editName () {
      this.name = this.user(this.me.id).name
      this.$refs.name.$refs.dialog.show()
    },
    async saveName () {
      this.$refs.name.$refs.dialog.hide()
      await this.$store.state.db.collection('users').doc(this.me.id).update({
        name: this.name,
        updatedAt: new Date()
      })
    },
    editMenuPosition () {
      this.menuPosition = this.$store.getters.menuPosition
      this.$refs.menuPosition.$refs.dialog.show()
    },
    async saveMenuPosition () {
      this.$refs.menuPosition.$refs.dialog.hide()
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        menuPosition: this.menuPosition.value,
        updatedAt: new Date()
      })
    },
    editTimezone () {
      this.timezone = this.me.timezone
      this.$refs.timezone.$refs.dialog.show()
    },
    async saveTimezone () {
      this.$refs.timezone.$refs.dialog.hide()
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        timezone: this.timezone,
        updatedAt: new Date()
      })
    },
    editLocale () {
      this.locale = this.currLocale
      this.$refs.locale.$refs.dialog.show()
    },
    async saveLocale () {
      this.$refs.locale.$refs.dialog.hide()
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        locale: this.locale.value,
        updatedAt: new Date()
      })
    },
    ...mapActions([
      'linkProvider',
      'unlinkProvider',
      'sendPasswordResetEmail',
      'signOut'
    ])
  },
  computed: {
    currMenuPosition () {
      return this.conf.styles.menuPositions.reduce(
        (ret, cur) => cur.value === this.me.menuPosition ? cur : ret,
        {}
      )
    },
    currLocale () {
      return this.conf.locales.locales.reduce(
        (ret, cur) => cur.value === this.me.locale ? cur : ret,
        {}
      )
    },
    ...mapGetters([
      'conf',
      'me',
      'user',
      'currentUser',
      'isSignInMethod',
      'isLine',
      'isFacebook',
      'isGithub',
      'isGoogle',
      'isTwitter',
      'isEmail'
    ])
  }
}
</script>
