<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="settings_applications" />
        {{ $t('preferences') }}
      </p>

      <div class="row">
        <div class="col q-pa-md col-xs-12 col-sm-6 col-md-4 col-lg-4">
          <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
          <q-separator class="q-my-md" />
          <div class="q-my-md">{{ $t('signInMethod') }}</div>

          <q-btn
            v-if="conf.auth.line && isLine"
            class="q-my-md full-width" align="left" outline color="green"
            icon="remove_circle_outline" :label="$t('removeProvider', { provider: 'LINE' })"
            @click="unlinkLine"
          />
          <q-btn
            v-else-if="conf.auth.line"
            class="q-my-md full-width" align="left" outline color="green"
            icon="add_circle_outline" :label="$t('addProvider', { provider: 'LINE' })"
            @click="linkWithLine"
          />

          <q-btn
            v-if="conf.auth.facebook && isFacebook"
            class="q-my-md full-width" align="left" outline color="blue-10"
            icon="remove_circle_outline" :label="$t('removeProvider', { provider: 'Facebook' })"
            @click="unlinkFacebook"
          />
          <q-btn
            v-else-if="conf.auth.facebook"
            class="q-my-md full-width" align="left" outline color="blue-10"
            icon="add_circle_outline" :label="$t('addProvider', { provider: 'Facebook' })"
            @click="linkWithFacebook"
          />

          <q-btn
            v-if="conf.auth.github && isGithub"
            class="q-my-md full-width" align="left" outline color="black"
            icon="remove_circle_outline" :label="$t('removeProvider', { provider: 'GitHub' })"
            @click="unlinkGithub"
          />
          <q-btn
            v-else-if="conf.auth.github"
            class="q-my-md full-width" align="left" outline color="black"
            icon="add_circle_outline" :label="$t('addProvider', { provider: 'GitHub' })"
            @click="linkWithGithub"
          />

          <q-btn
            v-if="conf.auth.google && isGoogle"
            class="q-my-md full-width" align="left" outline color="red-10"
            icon="remove_circle_outline" :label="$t('removeProvider', { provider: 'Google' })"
            @click="unlinkGoogle"
          />
          <q-btn
            v-else-if="conf.auth.google"
            class="q-my-md full-width" align="left" outline color="red-10"
            icon="add_circle_outline" :label="$t('addProvider', { provider: 'Google' })"
            @click="linkWithGoogle"
          />

          <q-btn
            v-if="conf.auth.twitter && isTwitter"
            class="q-my-md full-width" align="left" outline color="light-blue"
            icon="remove_circle_outline" :label="$t('removeProvider', { provider: 'Twitter' })"
            @click="unlinkTwitter"
          />
          <q-btn
            v-else-if="conf.auth.twitter"
            class="q-my-md full-width" align="left" outline color="light-blue"
            icon="add_circle_outline" :label="$t('addProvider', { provider: 'Twitter' })"
            @click="linkWithTwitter"
          />

          <div v-if="(conf.auth.emailLink || conf.auth.password) && isEmail">
            <q-separator class="q-my-md" />
            <div>{{ $t('emailAddressSaved') }}</div>
            <div>{{ $store.state.firebase.auth().currentUser.email }}</div>
          </div>
          <div v-else-if="conf.auth.emailLink || conf.auth.password">
            <q-separator class="q-my-md" />
            <q-input v-model="email" type="email" :rules="emailRule" :label="$t('emailAddress')">
              <template v-slot:before>
                <q-icon name="mail_outline" />
              </template>
            </q-input>
            <q-btn
              class="full-width" align="left" outline color="brown"
              icon="add_circle_outline" :label="$t('addProvider', { provider: $t('emailAddress') })"
              :disable="!validateEmail(email)"
              @click="linkWithEmail(email)"
            />
          </div>

        </div>
        <div class="col q-pa-md col-xs-12 col-sm-6 col-md-4 col-lg-4">
          <p>
            <q-select v-model="menuPosition" :options="conf.styles.menuPositions" :label="$t('menuPosition')" @input="onMenuPositionChanged" />
          </p>
          <p>
            <q-select v-model="timezone" :options="conf.locales.timezones" :label="$t('timezone')" @input="onTimezoneChanged" />
          </p>
          <p>
            <q-select v-model="locale" :options="conf.locales.locales" :label="$t('locale')" @input="onLocaleChanged" />
          </p>
          <p>
            <q-btn outline color="negative" :label="$t('signout')" @click="signOut" />
          </p>
        </div>

      </div>
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
      menuPosition: this.$store.state.conf.styles.menuPositions.reduce((ret, cur) => cur.value === this.$store.state.me.data().menuPosition ? cur : ret, null),
      timezone: this.$store.state.me.data().timezone,
      locale: this.$store.state.conf.locales.locales.reduce((ret, cur) => cur.value === this.$store.state.me.data().locale ? cur : ret, null)
    }
  },
  methods: {
    async onMenuPositionChanged () {
      await this.$store.state.db.collection('accounts').doc(this.$store.state.me.id).update({
        menuPosition: this.menuPosition.value,
        updatedAt: new Date()
      })
    },
    async onTimezoneChanged () {
      await this.$store.state.db.collection('accounts').doc(this.$store.state.me.id).update({
        timezone: this.timezone,
        updatedAt: new Date()
      })
    },
    async onLocaleChanged () {
      await this.$store.state.db.collection('accounts').doc(this.$store.state.me.id).update({
        locale: this.locale.value,
        updatedAt: new Date()
      })
    },
    ...mapActions([
      'linkWithLine',
      'linkWithFacebook',
      'linkWithGithub',
      'linkWithGoogle',
      'linkWithTwitter',
      'linkWithEmail',
      'unlinkLine',
      'unlinkFacebook',
      'unlinkGithub',
      'unlinkGoogle',
      'unlinkTwitter',
      'signOut'
    ])
  },
  computed: {
    ...mapGetters([
      'conf',
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
