<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-gutter-sm">
        <p :class="conf.styles.pageTitle">
          <q-icon name="settings_applications" />
          {{ $t('preferences') }}
        </p>
        <q-separator class="q-my-md" />
        <div class="q-my-md">ログイン方法の追加・削除</div>
        <p v-if="!isSignInMethod" class="text-red q-my-sm">1個以上のログイン方法を設定してください。</p>
        <q-btn
          v-if="$store.state.conf.auth.line && isLine"
          class="q-my-md full-width" align="left" outline color="green"
          icon="remove_circle_outline" label="Line を削除する"
          @click="unlinkLine"
        />
        <q-btn
          v-else-if="$store.state.conf.auth.lien"
          class="q-my-md full-width" align="left" outline color="green"
          icon="add_circle_outline" label="Line を追加する"
          @click="linkWithLine"
        />
        <q-btn
          v-if="$store.state.conf.auth.facebook && isFacebook"
          class="q-my-md full-width" align="left" outline color="blue-10"
          icon="remove_circle_outline" label="Facebook を削除する"
          @click="unlinkFacebook"
        />
        <q-btn
          v-else-if="$store.state.conf.auth.facebook"
          class="q-my-md full-width" align="left" outline color="blue-10"
          icon="add_circle_outline" label="Facebook を追加する"
          @click="linkWithFacebook"
        />
        <q-btn
          v-if="$store.state.conf.auth.twitter && isTwitter"
          class="q-my-md full-width" align="left" outline color="light-blue"
          icon="remove_circle_outline" label="Twitter を削除する"
          @click="unlinkTwitter"
        />
        <q-btn
          v-else-if="$store.state.conf.auth.twitter"
          class="q-my-md full-width" align="left" outline color="light-blue"
          icon="add_circle_outline" label="Twitter を追加する"
          @click="linkWithTwitter"
        />
        <div v-if="($store.state.conf.auth.emailLink || $store.state.conf.auth.password) && isEmail">
          <q-separator class="q-my-md" />
          <div>メールアドレス設定済み</div>
          <div>{{ $store.state.firebase.auth().currentUser.email }}</div>
        </div>
        <div v-else-if="$store.state.conf.auth.emailLink || $store.state.conf.auth.password">
          <q-separator class="q-my-md" />
          <q-input v-model="email" type="email" :rules="emailRule" label="メールアドレス">
            <template v-slot:before>
              <q-icon name="mail_outline" />
            </template>
          </q-input>
          <q-btn
            class="full-width" align="left" outline color="brown"
            icon="add_circle_outline" label="メールアドレスを追加する"
            :disable="!validateEmail(email)"
            @click="linkWithEmail(email)"
          />
        </div>
        <p>
          <q-btn outline color="negative" :label="$t('signout')" @click="signOut" />
        </p>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'
import { validateEmail, validatePassword } from '../utils/validators'

export default {
  name: 'PagePreferences',
  data () {
    return {
      email: '',
      isPwd: true,
      emailRule: [ v => (!v || validateEmail(v)) || '正しいメールアドレスを入力してください。' ]
    }
  },
  methods: {
    validateEmail,
    validatePassword,
    ...mapActions([
      'linkWithLine',
      'linkWithFacebook',
      'linkWithTwitter',
      'linkWithEmail',
      'unlinkFacebook',
      'unlinkTwitter',
      'unlinkLine',
      'signOut'
    ])
  },
  computed: {
    ...mapGetters([
      'conf',
      'isSignInMethod',
      'isTwitter',
      'isFacebook',
      'isLine',
      'isEmail'
    ])
  }
}
</script>
