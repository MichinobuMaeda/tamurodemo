<template>
  <div class="q-pa-md">
    <div class="row justify-center">
      <div class="col q-pa-xs col-xs-12 col-sm-6 col-md-5 col-lg-4 col-xl-4">
        <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
        <div class="q-my-md">{{ $t('signInWithSns') }}</div>
        <q-btn
          v-if="conf.auth.line"
          class="q-my-md full-width" align="left" outline color="green"
          label="Line"
          @click="signInWithLine($route)"
        />
        <q-btn
          v-if="conf.auth.facebook"
          class="q-my-md full-width" align="left" outline color="blue-10"
          label="Facebook"
          @click="signInWithFacebook($route)"
        />
        <q-btn
          v-if="conf.auth.github"
          class="q-my-md full-width" align="left" outline color="black"
          label="GitHub"
          @click="signInWithGithub($route)"
        />
        <q-btn
          v-if="conf.auth.google"
          class="q-my-md full-width" align="left" outline color="red-10"
          label="Google"
          @click="signInWithGoogle($route)"
        />
        <q-btn
          v-if="conf.auth.twitter"
          class="q-my-md full-width" align="left" outline color="light-blue"
          label="Twitter"
          @click="signInWithTwitter($route)"
        />
        <div v-if="conf.auth.emailLink">
          <q-separator class="q-my-md" />
          <div class="q-my-md">{{ $t('passwordlessSignIn') }}</div>
          <q-input v-model="email" type="email" :rules="emailRule" :label="$t('emailAddress')">
            <template v-slot:before>
              <q-icon name="mail_outline" />
            </template>
          </q-input>
          <q-btn
            class="full-width" align="left" outline color="brown-9"
            :label="$t('getEmailLink')"
            :disable="!validateEmail(email)"
            @click="signInWithEmailLink(email)"
          />
        </div>
        <q-separator class="q-my-md" />
        <div class="text-center">
          <q-btn
            flat rounded class="q-my-md" color="light-green-10"
            icon="security" :label="$t('privacyPolicy')"
            to="/policy"
          />
        </div>
      </div>
    </div>
  </div>
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
      emailRule: [ v => (!v || this.conf.validators.email(v)) || this.$t('invalidEmailAddress') ]
    }
  },
  methods: {
    ...mapActions([
      'signInWithLine',
      'signInWithFacebook',
      'signInWithGithub',
      'signInWithGoogle',
      'signInWithTwitter',
      'signInWithEmailLink'
    ])
  },
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}
</script>
