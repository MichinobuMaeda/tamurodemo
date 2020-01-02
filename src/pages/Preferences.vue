<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-8 col-md-6 col-lg-4 col-xl-4 q-pa-sm">
      <p :class="conf.styles.pageTitle">
        <q-avatar icon="fas fa-user-cog" />
        {{ $t('preferences') }}
      </p>

      <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
      <q-separator class="q-my-md" />
      <div class="q-my-md">{{ $t('signInMethod') }}</div>

      <q-btn
        v-if="{ provider: conf.auth.line } && isLine"
        class="q-my-md full-width" align="left" outline color="green"
        icon="fab fa-line" :label="$t('removeProvider', { provider: 'LINE' })"
        @click="unlinkProvider({ provider: conf.auth.line })"
      >
        <q-space />
        <q-icon :name="conf.styles.iconRemove" />
      </q-btn>
      <q-btn
        v-else-if="{ provider: conf.auth.line }"
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

      <p>
        <q-select
          v-model="menuPosition"
          :options="conf.styles.menuPositions"
          :label="$t('menuPosition')"
          @input="onMenuPositionChanged"
        />
      </p>
      <p>
        <q-select
          v-model="timezone"
          :options="conf.locales.timezones"
          :label="$t('timezone')"
          @input="onTimezoneChanged"
        />
      </p>
      <p>
        <q-select
          v-model="locale"
          :options="conf.locales.locales"
          :label="$t('locale')"
          @input="onLocaleChanged"
        />
      </p>
      <p>
        <q-btn
          class="q-my-md"
          outline color="negative"
          icon="fas fa-sign-out-alt" :label="$t('signout')"
          @click="signOut" />
      </p>
    </div>

  </q-page>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PagePreferences',
  data () {
    return {
      email: '',
      isPwd: true,
      emailRule: [ v => (!v || this.conf.validators.email(v)) || this.$t('invalidEmailAddress') ],
      menuPosition: this.$store.state.conf.styles.menuPositions.reduce(
        (ret, cur) => cur.value === this.$store.getters.menuPosition ? cur : ret,
        null
      ),
      timezone: this.$store.state.me || this.$store.state.me.timezone,
      locale: this.$store.state.conf.locales.locales.reduce(
        (ret, cur) => cur.value === this.$store.getters.locale ? cur : ret,
        null
      )
    }
  },
  methods: {
    async onMenuPositionChanged () {
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        menuPosition: this.menuPosition.value,
        updatedAt: new Date()
      })
    },
    async onTimezoneChanged () {
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        timezone: this.timezone,
        updatedAt: new Date()
      })
    },
    async onLocaleChanged () {
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
    ...mapGetters([
      'conf',
      'me',
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
