<template>
  <v-dialog
    max-width="640px"
    v-model="dialog"
    @click:outside="$emit('dialogChange', false)"
    @keydown.esc="$emit('dialogChange', false)"
  >
    <v-card>
      <v-card-title>
        <span class="h2--text text-h2">
          <v-icon large color="h2">{{ icon('Preferences') }}</v-icon>
          {{ $t('Preferences') }}
        </span>
        <v-spacer />
        <v-btn icon @click="$emit('dialogChange', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-switch
          v-model="account.darkTheme"
          :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
          @change="set('accounts', account.id, { darkTheme: account.darkTheme })"
        />
        <v-select
          v-model="account.menuPosition"
          :label="$t('Menu position')"
          :items="menuPositions"
          @change="set('accounts', account.id, { menuPosition: account.menuPosition })"
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
        <v-select
          v-model="account.locale"
          :label="$t('Locale')"
          :items="locales"
          @change="set('accounts', account.id, { locale: account.locale })"
        />
        <v-select
          v-model="account.tz"
          :label="$t('Timezone')"
          :items="timezones"
          @change="set('accounts', account.id, { tz: account.tz })"
        />

        <p>{{ withTz(page.now).format('llll') }}</p>

        <div v-if="auth.currentUser && auth.currentUser.email">
          <v-divider class="my-6" />

          <v-form v-model="page.changeEmail">

            <div class="text-h3 h3--text">
              <v-icon color="h3">{{ icon('E-mail') }}</v-icon>
              {{ $t('Change e-mail') }}
            </div>

            <v-text-field
              v-model="page.changeEmailPassword"
              :type="page.showChangeEmailPassword ? 'text' : 'password'"
              :rules="[
                v => validatePassword(v) || $t('Invalid password')
              ]"
              :label="$t('Password')"
              :append-icon="page.showChangeEmailPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showChangeEmailPassword = !page.showChangeEmailPassword"
            ></v-text-field>

            <v-text-field
              v-model="page.newEmail"
              type="text"
              :rules="[
                v => validateEmail(v) || $t('Invalid E-mail format')
              ]"
              :label="$t('New e-mail')"
            ></v-text-field>

            <v-text-field
              v-model="page.confirmEmail"
              type="text"
              :rules="[
                v => validateEmail(v) || $t('Invalid E-mail format'),
                v => v === page.newEmail || $t('E-mail confitmation failed')
              ]"
              :label="$t('Confirm New e-mail')"
            ></v-text-field>

            <v-row>
              <v-col>
                <div class="col-12 col-sm-9 info--text mt-2" v-if="page.changeEmailMessage">
                  {{ page.changeEmailMessage }}
                </div>
              </v-col>
              <v-col class="col-12 col-sm-3 text-right">
                <DefaultButton
                  color="primary"
                  :icon="icon('Save')"
                  :label="$t('Save')"
                  @click="changeEmail"
                  :disabled="!!state.waitProc || !page.changeEmailPassword || !page.newEmail || !page.confirmEmail || !page.changeEmail"
                />
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-6" />

          <v-form v-model="page.changePassword">

            <div class="text-h3 h3--text">
              <v-icon color="h3">{{ icon('Password') }}</v-icon>
              {{ $t('Change password') }}
            </div>

            <v-text-field
              v-model="page.oldPassword"
              :type="page.showOldPassword ? 'text' : 'password'"
              :rules="[
                v => validatePassword(v) || $t('Invalid password')
              ]"
              :label="$t('Old password')"
              :append-icon="page.showOldPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showOldPassword = !page.showOldPassword"
            ></v-text-field>

            <v-text-field
              v-model="page.newPassword"
              :type="page.showNewPassword ? 'text' : 'password'"
              :rules="[
                v => validatePassword(v) || $t('Invalid password')
              ]"
              :label="$t('New password')"
              :append-icon="page.showNewPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showNewPassword = !page.showNewPassword"
            ></v-text-field>

            <v-text-field
              v-model="page.confirmEmail"
              :type="page.showConfirmPassword ? 'text' : 'password'"
              :rules="[
                v => validatePassword(v) || $t('Invalid password'),
                v => v === page.newPassword || $t('Password confitmation failed')
              ]"
              :label="$t('Confirm new password')"
              :append-icon="page.showConfirmPassword ? icon('Visible') : icon('Invisible')"
              @click:append="page.showConfirmPassword = !page.showConfirmPassword"
            ></v-text-field>

            <v-row>
              <v-col>
                <div class="col-12 col-sm-9 info--text mt-2" v-if="page.changeEmailMessage">
                  {{ page.changePasswordMessage }}
                </div>
              </v-col>
              <v-col class="col-12 col-sm-3 text-right">
                <DefaultButton
                  color="primary"
                  :icon="icon('Save')"
                  :label="$t('Save')"
                  @click="changePassword"
                  :disabled="!!state.waitProc || !page.oldPassword || !page.newPassword || !page.confirmPassword || !page.changePassword"
                />
              </v-col>
            </v-row>
          </v-form>

          <div class="info--text py-2">{{ $t('Do not use or forget password') }}</div>
          <div class="text-right">
            <DefaultButton
              color="secondary"
              :icon="icon('E-mail')"
              :label="$t('Reset password')"
              :disabled="!!state.waitProc"
              @click="resetPassword"
            />
          </div>
        </div>
        <v-alert
          v-if="page.resetPasswordMessage"
          type="info" dense outlined
        >
          {{ page.resetPasswordMessage }}
        </v-alert>
        <div class="my-2">{{ $t('Ask system admin to change e-mail') }}</div>

        <v-divider class="my-4" />

        <ConfirmButton
          v-if="id === state.me.id"
          type="error"
          :title="$t('Sign out')"
          :iconProc="icon('Sign out')"
          :labelProc="$t('Sign out')"
          :message="$t('Confirm sign out')"
          @confirm="signOut"
          :disabled="!!state.waitProc"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed, reactive, onMounted, onUnmounted } from '@vue/composition-api'
import Firebase from 'firebase/app'
import 'firebase/auth'
import * as helpers from '@/helpers'
import ConfirmButton from '@/components/ConfirmButton'
import DefaultButton from '@/components/DefaultButton'

const { useStore, getById, topUrl, signInUrl } = helpers

export default {
  name: 'Preferences',
  components: {
    DefaultButton,
    ConfirmButton
  },
  model: {
    prop: 'dialog',
    event: 'dialogChange'
  },
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    id: String
  },
  setup (props, { root, emit }) {
    const store = useStore()
    const { auth, setProcForWait } = store
    const page = reactive({
      now: new Date().getTime(),
      secondaryUpdater: null,
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
        page.secondaryUpdater = setInterval(
          () => { page.now = new Date().getTime() },
          1000
        )
      }
    )

    onUnmounted(() => { clearInterval(page.secondaryUpdater) })

    const changeEmail = () => setProcForWait(
      async () => {
        try {
          const user = auth.currentUser
          await user.reauthenticateWithCredential(
            Firebase.auth.EmailAuthProvider.credential(
              user.email,
              page.changeEmailPassword
            )
          )
          await auth.currentUser.updateEmail(page.newEmail)

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
          const user = auth.currentUser
          await user.reauthenticateWithCredential(
            Firebase.auth.EmailAuthProvider.credential(
              user.email,
              page.oldPassword
            )
          )
          await auth.currentUser.updatePassword(page.newPassword)

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
          await auth.sendPasswordResetEmail(
            user.email,
            {
              url: topUrl(),
              handleCodeInApp: true
            }
          )
          page.resetPasswordMessage = root.$i18n.t('Sent message')
        } catch (e) {
          page.resetPasswordMessage = root.$i18n.t('System error')
        } finally {
          setTimeout(() => { page.resetPasswordMessage = '' }, 1000 * 1000)
        }
      }
    )

    const signOut = () => setProcForWait(
      async () => {
        emit('dialogChange', false)
        await auth.signOut()
        page.confirmSginOut = false
        window.location.href = signInUrl()
      }
    )

    return {
      account: computed(() => getById(store.state.accounts, props.id)),
      page,
      ...store,
      changeEmail,
      changePassword,
      resetPassword,
      signOut,
      ...helpers
    }
  }
}
</script>
