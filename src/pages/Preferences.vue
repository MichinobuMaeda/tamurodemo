<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Preferences')"
      >
        <template v-slot:title>{{ $t('Preferences') }}</template>
      </PageTitle>

      <v-row>
        <v-col class="col-12 col-sm-6">
          <v-switch
            v-model="darkTheme"
            :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
          />
        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="menuPosition"
            :label="$t('Menu position')"
            :items="conf.menuPositions"
          >
            <template slot="selection" slot-scope="data">
              <v-icon>{{ icon(data.item.text) }}</v-icon>
              {{ $t(data.item.text) }}
            </template>
            <template slot="item" slot-scope="data">
              <v-icon>{{ icon(data.item.text) }}</v-icon>
              {{ $t(data.item.text) }}
            </template>
          </v-select>

        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="locale"
            :label="$t('Locale')"
            :items="conf.locales"
          />
        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="tz"
            :label="$t('Timezone')"
            :items="conf.timezones"
          />
        </v-col>

        <v-col class="col-12 text-right">
          <div>{{ withTz(page.now).format('llll') }}</div>
        </v-col>
      </v-row>

      <v-divider class="my-4" v-if="state.me.email" />

      <v-row v-if="state.me.email">

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
          :icon="icon('E-mail')"
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
        :iconProc="icon('Sign out')"
        :labelProc="$t('Sign out')"
        :message="$t('Confirm sign out')"
        @confirm="signOut"
        :disabled="!!state.waitProc"
      />
    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed, onMounted, onUnmounted } from '@vue/composition-api'
import * as conf from '@/conf'
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

export default {
  name: 'Preferences',
  components: {
    PageTitle,
    DefaultButton,
    ConfirmButton,
    SelectAuthProviders,
    FormWithConfirmatioin
  },
  setup () {
    const store = useStore()
    const { auth, state, waitFor, update } = store
    const page = reactive({
      now: new Date().getTime(),
      everySecondUpdater: null,
      resetPasswordMessage: ''
    })

    onMounted(() => { page.everySecondUpdater = setInterval(() => { page.now = new Date().getTime() }, 1000) })
    onUnmounted(() => { clearInterval(page.everySecondUpdater) })

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
      conf,
      page,
      ...store,
      darkTheme: computed({
        get: () => state.me.darkTheme,
        set: val => waitFor(() => update(state.me, { darkTheme: val }))
      }),
      menuPosition: computed({
        get: () => state.me.menuPosition,
        set: val => waitFor(() => update(state.me, { menuPosition: val }))
      }),
      locale: computed({
        get: () => state.me.locale,
        set: val => waitFor(() => update(state.me, { locale: val }))
      }),
      tz: computed({
        get: () => state.me.tz,
        set: val => waitFor(() => update(state.me, { tz: val }))
      }),
      resetPassword,
      updateMyEmail: value => updateMyEmail(store, value),
      updateMyPassword: value => updateMyPassword(store, value),
      signOut: () => waitFor(() => signOut(store))
    }
  }
}
</script>
