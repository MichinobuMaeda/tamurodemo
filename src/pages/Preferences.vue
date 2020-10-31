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
            v-model="state.me.darkTheme"
            :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
            @change="waitForUpdate('accounts', state.me.id, { darkTheme: state.me.darkTheme })"
          />
        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="state.me.menuPosition"
            :label="$t('Menu position')"
            :items="menuPositions"
            @change="waitForUpdate('accounts', state.me.id, { menuPosition: state.me.menuPosition })"
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
            v-model="state.me.locale"
            :label="$t('Locale')"
            :items="locales"
            @change="waitForUpdate('accounts', state.me.id, { locale: state.me.locale })"
          />
        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="state.me.tz"
            :label="$t('Timezone')"
            :items="timezones"
            @change="waitForUpdate('accounts', state.me.id, { tz: state.me.tz })"
          />
        </v-col>

        <v-col class="col-12 text-right">
          <div>{{ withTz(page.now).format('llll') }}</div>
        </v-col>
      </v-row>

      <v-divider class="my-4" v-if="state.me.email" />

      <v-row v-if="state.me.email">
        <v-col class="col-12 col-sm-6">
          <v-form v-model="page.changeEmail">

            <div class="text-h3 h3--text mb-4">
              <v-icon color="h3">{{ icon('E-mail') }}</v-icon>
              {{ $t('Change e-mail') }}
            </div>

            <v-text-field
              v-model="page.changeEmailPassword"
              :type="page.showChangeEmailPassword ? 'text' : 'password'"
              :rules="[rulePassword]"
              :label="$t('Password')"
              :append-icon="page.showChangeEmailPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showChangeEmailPassword = !page.showChangeEmailPassword"
            ></v-text-field>

            <v-text-field
              v-model="page.newEmail"
              type="text"
              :rules="[ruleEmail]"
              :label="$t('New e-mail')"
            ></v-text-field>

            <v-text-field
              v-model="page.confirmEmail"
              type="text"
              :rules="[ruleEmail]"
              :label="$t('Confirm new e-mail')"
            ></v-text-field>
            <div
              v-if="page.newEmail && page.confirmEmail && (page.newEmail !== page.confirmEmail)"
              class="error--text" style="font-size: 12px;"
            >
              {{ $t('E-mail confirmation failed') }}
            </div>

            <v-alert dense outlined text type="warning" v-if="page.changeEmailMessage">
              {{ page.changeEmailMessage }}
            </v-alert>
            <div class="text-right">
              <DefaultButton
                color="primary"
                :icon="icon('Save')"
                :label="$t('Save')"
                @click="changeEmail"
                :disabled="!!state.waitProc || !page.changeEmailPassword || !page.newEmail || !page.confirmEmail || page.newEmail !== page.confirmEmail || !page.changeEmail"
              />
            </div>
          </v-form>
        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-form v-model="page.changePassword">

            <div class="text-h3 h3--text mb-4">
              <v-icon color="h3">{{ icon('Password') }}</v-icon>
              {{ $t('Change password') }}
            </div>

            <v-text-field
              v-model="page.oldPassword"
              :type="page.showOldPassword ? 'text' : 'password'"
              :rules="[rulePassword]"
              :label="$t('Old password')"
              :append-icon="page.showOldPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showOldPassword = !page.showOldPassword"
            ></v-text-field>

            <v-text-field
              v-model="page.newPassword"
              :type="page.showNewPassword ? 'text' : 'password'"
              :rules="[rulePassword]"
              :label="$t('New password')"
              :append-icon="page.showNewPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showNewPassword = !page.showNewPassword"
            ></v-text-field>

            <v-text-field
              v-model="page.confirmPassword"
              :type="page.showConfirmPassword ? 'text' : 'password'"
              :rules="[rulePassword]"
              :label="$t('Confirm new password')"
              :append-icon="page.showConfirmPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showConfirmPassword = !page.showConfirmPassword"
            ></v-text-field>
            <div
              v-if="page.newPassword && page.confirmPassword && (page.newPassword !== page.confirmPassword)"
              class="error--text" style="font-size: 12px;"
            >
              {{ $t('New password confirmation failed') }}
            </div>

            <v-alert dense outlined text type="warning" v-if="page.changePasswordMessage">
              {{ page.changePasswordMessage }}
            </v-alert>
            <div class="text-right">
              <DefaultButton
                color="primary"
                :icon="icon('Save')"
                :label="$t('Save')"
                @click="changePassword"
                :disabled="!!state.waitProc || !page.oldPassword || !page.newPassword || !page.confirmPassword || page.newPassword !== page.confirmPassword || !page.changePassword"
              />
            </div>
          </v-form>
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
          {{ page.resetPasswordMessage }}
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
import { reactive, onMounted, onUnmounted } from '@vue/composition-api'
import { locales, menuPositions, timezones } from '@/conf'
import { useStore } from '../store'
import {
  reauthenticate, updateMyEmail, updateMyPassword, sendPasswordResetEmail,
  signOut
} from '../auth'
import PageTitle from '../components/PageTitle'
import DefaultButton from '../components/DefaultButton'
import ConfirmButton from '../components/ConfirmButton'
import SelectAuthProviders from '../parts/SelectAuthProviders'

export default {
  name: 'Preferences',
  components: {
    PageTitle,
    DefaultButton,
    ConfirmButton,
    SelectAuthProviders
  },
  setup (props, { root, emit }) {
    const store = useStore()
    const { auth, setProcForWait } = store
    const page = reactive({
      now: new Date().getTime(),
      everySecondUpdater: null,
      changePassword: false,
      changePasswordMessage: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      changeEmail: false,
      changeEmailMessage: '',
      changeEmailPassword: '',
      newEmail: '',
      confirmEmail: '',
      showChangeEmailPassword: false,
      resetPasswordMessage: ''
    })

    onMounted(
      () => {
        page.everySecondUpdater = setInterval(
          () => { page.now = new Date().getTime() },
          1000
        )
      }
    )

    onUnmounted(() => { clearInterval(page.everySecondUpdater) })

    const changeEmail = () => setProcForWait(
      async () => {
        try {
          await reauthenticate(store, page.changeEmailPassword)
          await updateMyEmail(store, page.newEmail)

          page.changeEmailPassword = ''
          page.newEmail = ''
          page.confirmEmail = ''
          page.showChangeEmailPassword = false
          page.changeEmailMessage = root.$i18n.t('Completed')
        } catch (e) {
          page.changeEmailMessage = root.$i18n.t('Incorrect password')
        } finally {
          setTimeout(() => { page.changeEmailMessage = '' }, 10 * 1000)
        }
      }
    )

    const changePassword = () => setProcForWait(
      async () => {
        try {
          await reauthenticate(store, page.oldPassword)
          await updateMyPassword(store, page.newPassword)

          page.oldPassword = ''
          page.newPassword = ''
          page.confirmPassword = ''
          page.showOldPassword = false
          page.showNewPassword = false
          page.showConfirmPassword = false
          page.changePasswordMessage = root.$i18n.t('Completed')
        } catch (e) {
          page.changePasswordMessage = root.$i18n.t('Incorrect password')
        } finally {
          setTimeout(() => { page.changePasswordMessage = '' }, 10 * 1000)
        }
      }
    )

    const resetPassword = () => setProcForWait(
      async () => {
        try {
          const user = auth.currentUser
          await sendPasswordResetEmail(store, user.email)
          page.resetPasswordMessage = root.$i18n.t('Sent message')
        } catch (e) {
          page.resetPasswordMessage = root.$i18n.t('System error')
        } finally {
          setTimeout(() => { page.resetPasswordMessage = '' }, 1000 * 1000)
        }
      }
    )

    return {
      page,
      ...store,
      changeEmail,
      changePassword,
      resetPassword,
      signOut: () => setProcForWait(() => signOut(store)),
      locales,
      menuPositions,
      timezones
    }
  }
}
</script>
