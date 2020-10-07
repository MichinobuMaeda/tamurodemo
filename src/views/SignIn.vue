<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Sign in')"
      >
        <template v-slot:title>{{ $t('Sign in') }}</template>
      </PageTitle>
      <v-alert
        v-if="page.result.type"
        dense outlined
        :type="page.result.type"
      >
        {{ $t(page.result.desc) }}
      </v-alert>
      <div class="text-right">
        <LinkButton
          :icon="icon('Privacy policy')"
          :label="$t('Privacy policy')"
          @click="() => goPage($router, { name: 'policy' })"
        />
      </div>
      <v-form ref="form" v-model="page.valid">
        <v-text-field
          v-model="page.email"
          :rules="[
            v => validateEmail(v) || $t('Invalid E-mail format')
          ]"
          :label="$t('E-mail')"
        ></v-text-field>
        <div :class="page.valid && page.email ? 'primary--text' : 'grey--text'">
          {{ $t('Select sign-in method without password') }}
        </div>
        <div class="text-right">
          <DefaultButton
            color="primary"
            :icon="icon('E-mail')"
            :label="$t('Get sign-in link')"
            :disabled="!!state.waitProc || !page.valid || !page.email"
            @click="signInWithEmailLink"
          />
        </div>
        <v-text-field
          v-model="page.password"
          :type="page.showPassword ? 'text' : 'password'"
          :rules="[
            v => validatePassword(v) || $t('Invalid password')
          ]"
          :label="$t('Password')"
          :append-icon="page.showPassword ? icon('Visible') : icon('Invisible')"
          @click:append="page.showPassword = !page.showPassword"
        ></v-text-field>
        <div class="text-right">
          <DefaultButton
            color="primary"
            :icon="icon('Sign in')"
            :label="$t('Sign-in with password')"
            :disabled="!!state.waitProc || !page.valid || !page.email || !page.password"
            @click="signInWithPassword"
          />
        </div>
        <div>
          {{ $t('Forgot password?') }}
        </div>
        <div class="text-right">
          <DefaultButton
            color="secondary"
            :icon="icon('E-mail')"
            :label="$t('Reset password')"
            :disabled="!!state.waitProc || !page.valid || !page.email"
            @click="resetPassword"
          />
        </div>
      </v-form>
      <div class="my-2">{{ $t('Ask system admin to change e-mail') }}</div>
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import DefaultButton from '@/components/DefaultButton'
import LinkButton from '@/components/LinkButton'

const { useStore, topUrl, storeRequestedEmail } = helpers

export default {
  name: 'PageSignIn',
  components: {
    PageTitle,
    DefaultButton,
    LinkButton
  },
  setup () {
    const store = useStore()
    const { setProcForWait, auth } = store
    const page = reactive({
      result: {},
      valid: true,
      email: '',
      password: '',
      showPassword: false
    })

    const signInWithEmailLink = () => setProcForWait(
      async () => {
        await auth.sendSignInLinkToEmail(page.email, {
          url: window.location.href,
          handleCodeInApp: true
        })
        storeRequestedEmail(page.email)
        page.result = { type: 'success', desc: 'Sent message' }
      }
    )

    const signInWithPassword = () => setProcForWait(
      async () => {
        try {
          await auth.signInWithEmailAndPassword(
            page.email,
            page.password
          )
        } catch (e) {
          page.result = { type: 'error', desc: 'Invalid email or password' }
        }
      }
    )

    const resetPassword = () => setProcForWait(
      async () => {
        await auth.sendPasswordResetEmail(
          page.email,
          {
            url: topUrl(),
            handleCodeInApp: true
          }
        )
        page.result = { type: 'success', desc: 'Sent message' }
        // window.localStorage.setItem('tamuroAuthMessage', '')
      }
    )

    return {
      page,
      ...store,
      signInWithEmailLink,
      signInWithPassword,
      resetPassword,
      ...helpers
    }
  }
}
</script>
