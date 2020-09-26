<template>
  <v-row justify="center">
    <v-col sm="8" md="6" lg="5" xl="4">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Sign in')"
        :icon="icon('Sign in')"
      />
      <v-alert type="success" dense outlined v-if="state.authMessage">
        {{ $t(state.authMessage) }}
      </v-alert>
      <div class="text-right">
        <LinkButton
          :icon="icon('Privacy policy')"
          :label="$t('Privacy policy')"
          @click="() => goPage($router, { name: 'policy' })"
        />
      </div>
      <v-form ref="form" v-model="state.credential.valid">
        <v-text-field
          v-model="state.credential.email"
          :rules="[
            v => validateEmail(v) || $t('Invalid E-mail format')
          ]"
          :label="$t('E-mail')"
        ></v-text-field>
        <div :class="state.credential.valid && state.credential.email ? 'primary--text' : 'grey--text'">
          {{ $t('Select sign-in method without password') }}
        </div>
        <div class="text-right">
          <ButtonPrimary
            :icon="icon('E-mail')"
            :label="$t('Get sign-in link')"
            :disabled="state.waitUpdate || !state.credential.valid || !state.credential.email"
            @click="waitProc(state, () => signInWithEmailLink(state))"
          />
        </div>
        <v-text-field
          v-model="state.credential.password"
          :type="state.showPassword ? 'text' : 'password'"
          :rules="[
            v => validatePassword(v) || $t('Invalid password')
          ]"
          :label="$t('Password')"
          :append-icon="state.showPassword ? icon('Visible') : icon('Invisible')"
          @click:append="state.showPassword = !state.showPassword"
        ></v-text-field>
        <div class="text-right">
          <ButtonPrimary
            :icon="icon('Sign in')"
            :label="$t('Sign-in with password')"
            :disabled="state.waitUpdate || !state.credential.valid || !state.credential.email || !state.credential.password"
            @click="waitProc(state, () => signInWithPassword(state))"
          />
        </div>
        <div>
          {{ $t('Forgot password?') }}
        </div>
        <div class="text-right">
          <ButtonSecondary
            :icon="icon('E-mail')"
            :label="$t('Reset password')"
            :disabled="state.waitUpdate || !state.credential.valid || !state.credential.email"
            @click="waitProc(state, () => resetPassword(state))"
          />
        </div>
      </v-form>
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import ButtonPrimary from '../components/ButtonPrimary'
import ButtonSecondary from '../components/ButtonSecondary'
import LinkButton from '../components/LinkButton'

export default {
  name: 'SignInPolicy',
  components: {
    PageTitle,
    ButtonPrimary,
    ButtonSecondary,
    LinkButton
  },
  setup () {
    return useStore()
  }
}
</script>
