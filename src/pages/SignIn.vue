<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col q-pa-xs col-xs-12 col-sm-6 col-md-5 col-lg-4 col-xl-4">
        <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
        <div class="q-my-md">{{ $t('signInWithSns') }}</div>
        <q-btn
          v-if="conf.auth.line"
          class="q-my-md full-width" align="left" outline color="green"
          label="Line" icon="fab fa-line"
          @click="signInWithProvider({ provider: conf.auth.line })"
        />
        <q-btn
          v-if="conf.auth.facebook"
          class="q-my-md full-width" align="left" outline color="blue-10"
          label="Facebook" icon="fab fa-facebook"
          @click="signInWithProvider({ provider: conf.auth.facebook })"
        />
        <q-btn
          v-if="conf.auth.github"
          class="q-my-md full-width" align="left" outline color="black"
          label="GitHub" icon="fab fa-github"
          @click="signInWithProvider({ provider: conf.auth.github })"
        />
        <q-btn
          v-if="conf.auth.google"
          class="q-my-md full-width" align="left" outline color="red-10"
          label="Google" icon="fab fa-google"
          @click="signInWithProvider({ provider: conf.auth.google })"
        />
        <q-btn
          v-if="conf.auth.twitter"
          class="q-my-md full-width" align="left" outline color="light-blue"
          label="Twitter" icon="fab fa-twitter"
          @click="signInWithProvider({ provider: conf.auth.twitter })"
        />
        <div v-if="conf.auth.emailLink">
          <q-separator class="q-my-md" />
          <div class="q-my-md">{{ $t('passwordlessSignIn') }}</div>
          <q-input v-model="email" type="email" :rules="emailRule" :label="$t('emailAddress')">
            <template v-slot:before>
              <q-icon name="far fa-envelope" />
            </template>
          </q-input>
          <q-btn
            class="full-width" align="left" outline color="brown-9"
            :label="$t('getEmailLink')"
            :disable="(!email) || (!conf.validators.email(email))"
            @click="signInWithProvider({ provider: conf.auth.emailLink, email })"
          >
            <q-space />
            <q-icon name="fas fa-reply" />
          </q-btn>
        </div>
        <div v-if="conf.auth.password">
          <q-separator class="q-my-md" />
          <div class="q-my-md">{{ $t('signInWithEmailAndPassword') }}</div>
          <q-input v-model="password" type="password" :rules="passwordRule" :label="$t('password')">
            <template v-slot:before>
              <q-icon name="fas fa-key" />
            </template>
          </q-input>
          <q-btn
            class="q-my-md full-width" align="left" outline color="brown"
            :label="$t('signInWithPassword')"
            :disable="(!email) || (!conf.validators.email(email)) || (!password) || (!conf.validators.password(password))"
            @click="signInWithProvider({ provider: conf.auth.password, email, password })"
          />
          <q-btn
            class="q-my-md full-width" align="left" outline color="brown"
            icon="fas fa-key" :label="$t('resetPassword')"
            :disable="(!email) || (!conf.validators.email(email))"
            @click="sendPasswordResetEmail(email)"
          >
            <q-space />
            <q-icon name="fas fa-reply" />
          </q-btn>
        </div>
        <q-separator class="q-my-md" />
        <div class="text-center">
          <q-btn
            flat rounded class="q-my-md" color="light-green-10"
            icon="fas fa-shield-alt" :label="$t('privacyPolicy')"
            :to="{ name: 'policy' }"
          />
        </div>
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
      'conf'
    ])
  }
}
</script>
