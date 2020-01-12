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
    </div>

    <div :class="conf.styles.col2">
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
      <div v-if="conf.auth.password">
        <q-separator class="q-my-md" />
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
      <q-separator class="q-my-md" />
      <div class="text-center">
        <q-btn
          flat rounded class="q-my-md" color="light-green-10"
          :icon="conf.styles.iconPrivacyPolicy" :label="$t('privacyPolicy')"
          :to="{ name: 'policy' }"
        />
      </div>
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
      passwordRule: [ v => (!v || this.conf.validators.password(v)) || this.$t('invalidPassword') ]
    }
  },
  methods: {
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
