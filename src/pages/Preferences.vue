<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="conf.icon('Preferences')"
      >
        <template v-slot:title>{{ $t('Preferences') }}</template>
      </PageTitle>

      <UiPreferences :entity="state.me" />

      <v-divider class="my-4" v-if="me.email" />

      <v-row v-if="me.email">

        <v-col class="col-12 col-sm-6">
          <FormWithConfirmatioin
            titleIcon="E-mail"
            titleText="Change e-mail"
            labelCurrentPassword="Password"
            labelValue="New e-mail"
            labelConfirmation="Confirm new e-mail"
            messageComfirmationFailed="E-mail confirmation failed"
            messageUpdateFailed="Incorrect password"
            :password="false"
            :rules="[ruleEmail]"
            @click="updateMyEmail"
          />
        </v-col>

        <v-col class="col-12 col-sm-6">
          <FormWithConfirmatioin
            titleIcon="Password"
            titleText="Change password"
            labelCurrentPassword="Old password"
            labelValue="New password"
            labelConfirmation="Confirm new password"
            messageComfirmationFailed="New password confirmation failed"
            messageUpdateFailed="Incorrect password"
            :password="true"
            :rules="[rulePassword]"
            @click="updateMyPassword"
          />
        </v-col>

      </v-row>

      <div v-if="state.me.email">

        <v-divider class="my-2" />

        <div class="text-h3 h3--text my-4">
          {{ $t('Do not use or forget password') }}
        </div>
        <p>
          {{ $t('Ask system admin to change e-mail address for sign-in') }}
        </p>

        <DefaultButton
          color="secondary"
          :icon="conf.icon('E-mail')"
          :label="$t('Reset password')"
          :disabled="!!state.waitProc"
          @click="resetPassword"
        />
        <v-alert
          v-if="page.resetPasswordMessage"
          type="info" dense outlined class="my-2"
        >
          {{ $t(page.resetPasswordMessage) }}
        </v-alert>
      </div>
      <div v-else>
        <v-alert type="info" dense outlined class="my-2">
          {{ $t('No e-mail address for sign-in') }}
          {{ $t('Ask system admin to set e-mail address for sign-in') }}
        </v-alert>
      </div>

      <v-divider class="my-4" />

      <SelectAuthProviders />

      <v-divider class="my-4" />

      <ConfirmButton
        type="error"
        :title="$t('Sign out')"
        :iconProc="conf.icon('Sign out')"
        :labelProc="$t('Sign out')"
        :message="$t('Confirm sign out')"
        @confirm="signOut"
        :disabled="!!state.waitProc"
      />
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useStore } from '../store'
import {
  updateMyEmail, updateMyPassword, sendPasswordResetEmail,
  signOut
} from '../auth'
import PageTitle from '../components/PageTitle'
import DefaultButton from '../components/DefaultButton'
import ConfirmButton from '../components/ConfirmButton'
import SelectAuthProviders from '../parts/SelectAuthProviders'
import FormWithConfirmatioin from '../parts/FormWithConfirmatioin'
import UiPreferences from '../parts/UiPreferences'

export default {
  name: 'Preferences',
  components: {
    PageTitle,
    DefaultButton,
    ConfirmButton,
    SelectAuthProviders,
    FormWithConfirmatioin,
    UiPreferences
  },
  setup () {
    const store = useStore()
    const { auth, waitFor } = store
    const page = reactive({
      resetPasswordMessage: ''
    })

    const resetPassword = () => waitFor(
      async () => {
        try {
          await sendPasswordResetEmail(store, auth.currentUser.email)
          page.resetPasswordMessage = 'Sent message'
        } catch (e) {
          page.resetPasswordMessage = 'System error'
        } finally {
          setTimeout(() => { page.resetPasswordMessage = '' }, 1000 * 1000)
        }
      }
    )

    return {
      page,
      ...store,
      resetPassword,
      updateMyEmail: value => updateMyEmail(store, value),
      updateMyPassword: value => updateMyPassword(store, value),
      signOut: () => waitFor(() => signOut(store))
    }
  }
}
</script>
