<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col2">
      <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
      <div class="q-my-md">{{ $t('signInWithSns') }}</div>
      <div v-for="(item, index) in oauthProviders" v-bind:key="index">
        <q-btn
          v-if="item.id"
          class="q-my-md full-width" align="left" outline no-caps :color="item.color"
          :label="item.name" :icon="item.icon"
          @click="signInWithProvider({ provider: item.id })"
        />
      </div>

      <q-separator class="q-my-md" />

      <div v-if="conf.auth.emailLink">
        <div class="q-my-md">{{ $t('passwordlessSignIn') }}</div>
        <q-input v-model="email" type="email" :rules="emailRule" :label="$t('emailAddress')">
          <template v-slot:before>
            <q-icon :name="conf.styles.iconEmail" />
          </template>
        </q-input>
        <q-btn
          class="q-my-md full-width" align="left" outline no-caps color="brown-9"
          :label="$t('getEmailLink')"
          :disable="(!email) || (!conf.validators.email(email))"
          @click="signInWithProvider({ provider: conf.auth.emailLink, email })"
        >
          <q-space />
          <q-icon :name="conf.styles.iconReply" />
        </q-btn>
      </div>

      <q-separator v-if="conf.auth.password" class="q-my-md" />

      <div v-if="conf.auth.password">
        <div class="q-my-md">{{ $t('signInWithEmailAndPassword') }}</div>
        <q-input v-model="password" type="password" :rules="passwordRule" :label="$t('password')">
          <template v-slot:before>
            <q-icon :name="conf.styles.iconPassword" />
          </template>
        </q-input>
        <q-btn
          class="q-my-md full-width" align="left" outline no-caps color="brown"
          :label="$t('signInWithPassword')"
          :disable="(!email) || (!conf.validators.email(email)) || (!password) || (!conf.validators.password(password))"
          @click="signInWithProvider({ provider: conf.auth.password, email, password })"
        />
        <q-btn
          class="q-my-md full-width" align="left" outline no-caps color="brown"
          :icon="conf.styles.iconPassword" :label="$t('resetPassword')"
          :disable="(!email) || (!conf.validators.email(email))"
          @click="sendPasswordResetEmail(email)"
        >
          <q-space />
          <q-icon :name="conf.styles.iconReply" />
        </q-btn>
      </div>

    </div>
    <div :class="conf.styles.col2">

      <q-select
        class="q-ma-md"
        :label="$t('locale')"
        map-options
        v-model="locale"
        :options="conf.locales.locales"
        @input="onChangeLocale"
      >
        <template v-slot:before>
          <q-icon :name="conf.styles.iconLocale" />
        </template>
      </q-select>

      <q-btn
        flat rounded color="light-green-10"
        :icon="conf.styles.iconPrivacyPolicy" :label="$t('privacyPolicy')"
        :to="{ name: 'policy' }"
      />

      <q-separator class="q-my-md" />

      <div class="text-light-green-10 q-px-sm">
        <q-avatar :icon="conf.styles.iconInquire" />
        {{ $t('contactUs') }}
      </div>

      <div v-if="contactReceived" class="q-px-md">
        <p>{{ $t('contactReveived') }}</p>
        <div class="text-secondary">{{ $t('contactName') }}</div>
        <p>{{ contactName }}</p>
        <div class="text-secondary">{{ $t('contactMeans') }}:</div>
        <p>{{ contactMeans }}</p>
        <div class="text-secondary">{{ $t('contactMessage') }}:</div>
        <div v-for="(line, index) in contactMessage.split('\n')" :key="index">{{ line }}</div>
      </div>
      <q-form v-else ref="contact" class="q-px-md">
        <q-input
          outlined type="text" :label="$t('contactName')"
          v-model="contactName"
          :rules="[ v => !!v.trim() || $t('required') ]"
        />
        <q-input
          outlined type="text" :label="$t('contactMeans')"
          v-model="contactMeans"
          :rules="[ v  => !!v.trim() || $t('required') ] "
        />
        <q-input
          outlined type="textarea" :label="$t('contactMessage')"
          v-model="contactMessage"
          :rules="[ v => !!v.trim() || $t('required') ]"
        />
        <q-btn
          class="q-ma-sm float-right" no-caps color="primary"
          :label="$t('ok')"
          @click="sendContactMessage"
          :disable="!contactName.trim() || !contactMeans.trim() || !contactMessage.trim()"
        />
      </q-form>

    </div>
  </q-page>
</template>

<style scoped>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PageSignIn',
  data () {
    return {
      email: '',
      emailRule: [ v => (!v || this.conf.validators.email(v)) || this.$t('invalidEmailAddress') ],
      password: '',
      passwordRule: [ v => (!v || this.conf.validators.password(v)) || this.$t('invalidPassword') ],
      locale: this.$store.state.preferences.locale,
      contactName: '',
      contactMeans: '',
      contactMessage: '',
      contactReceived: false
    }
  },
  methods: {
    async sendContactMessage () {
      this.contactName = this.contactName.trim()
      this.contactMeans = this.contactMeans.trim()
      this.contactMessage = this.contactMessage.trim()
      await this.$store.state.functions.httpsCallable('receiveContactMessage')({
        contactName: this.contactName,
        contactMeans: this.contactMeans,
        contactMessage: this.contactMessage
      })
      this.contactReceived = true
    },
    onChangeLocale () {
      this.$store.state.preferences.locale = this.locale.value
      this.$root.$i18n.locale = this.$store.state.preferences.locale
    },
    ...mapActions([
      'signInWithProvider',
      'sendPasswordResetEmail'
    ])
  },
  computed: {
    ...mapGetters([
      'conf',
      'oauthProviders'
    ])
  }
}
</script>
