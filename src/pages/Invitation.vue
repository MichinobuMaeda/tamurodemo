<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-alert
        v-if="page.preview"
        type="warning" outlined
      >
        <div>{{ $t('Administrators only') }}</div>
        <div>{{ $t('Buttons are disabled') }}</div>
        <LinkButton
          :icon="conf.icon('Service settings')"
          :label="$t('Return to', { target: $t('Administration') })"
          @click="goPage({ name: 'admin', params: { target: 'aboutInvitation' } })"
        />
      </v-alert>
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="conf.icon('Guide')"
      >
        <template v-slot:title>{{ $t('Wellcome to the app', { user: me.name }) }}</template>
      </PageTitle>

      <div v-if="page.error">
        <v-alert type="error" outlined text class="mt-4">
          {{ $t('Invitation link authentication error') }}
        </v-alert>
      </div>
      <div v-else-if="!me || !me.valid">
        <v-alert type="info" outlined text class="mt-4">
          {{ $t('Please wait') }}
        </v-alert>
        <Loading color="h2" :size="96" />
      </div>
      <div v-else>
        <v-sheet
          v-if="state.service.conf.aboutInvitation && state.service.conf.aboutInvitation.data"
          outlined rounded class="px-3 pt-3 mb-4"
        >
          <FormattedTextEditor
            v-model="state.service.conf.aboutInvitation"
            @save="val => waitFor(() => update(state.service.conf, { aboutInvitation: val }))"
            :editable="false"
            :disabled="true"
          />
        </v-sheet>

        <Chats
          class="my-2"
          :accountId="me.id"
          :height="state.chatPaneHeight"
        />

        <div v-if="me.email && !page.preview">
          <v-alert type="info" outlined dense>
            <div>{{ $t('E-mail address for sign-inhas been set') }}</div>
            <v-icon>{{ conf.icon('E-mail') }}</v-icon> {{ me.email }}
            <div>
              <LinkButton
                class="ma-2"
                :icon="conf.icon('Top')"
                :label="$t('Top')"
                @click="goPage({ name: 'top' })"
              />
              <LinkButton
                class="ma-2"
                :icon="conf.icon('Profile')"
                :label="$t('Profile', { user: me.name })"
                @click="goPage({ name: 'user', params: { id: me.id, mode: 'edit' } })"
              />
            </div>
          </v-alert>
        </div>
        <div v-else>
          <v-form v-model="page.setEmail">
            <v-row>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.newEmail"
                  type="text"
                  :rules="[ruleEmail]"
                  :label="$t('E-mail')"
                ></v-text-field>
              </v-col>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.confirmEmail"
                  type="text"
                  :rules="[ruleEmail]"
                  :label="$t('Confirm e-mail')"
                ></v-text-field>
              </v-col>
              <v-col
                v-if="page.newEmail && page.confirmEmail && (page.newEmail !== page.confirmEmail)"
                class="col-12 error--text" style="font-size: 12px;"
              >
                {{ $t('E-mail confirmation failed') }}
              </v-col>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.newPassword"
                  :type="page.showNewPassword ? 'text' : 'password'"
                  :rules="[rulePassword]"
                  :label="$t('Password')"
                  :append-icon="page.showNewPassword ? conf.icon('Visible') : conf.icon('Invisible')"
                  @click:append="page.showNewPassword = !page.showNewPassword"
                ></v-text-field>
              </v-col>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.confirmPassword"
                  :type="page.showConfirmPassword ? 'text' : 'password'"
                  :rules="[rulePassword]"
                  :label="$t('Confirm password')"
                  :append-icon="page.showConfirmPassword ? conf.icon('Visible') : conf.icon('Invisible')"
                  @click:append="page.showConfirmPassword = !page.showConfirmPassword"
                ></v-text-field>
              </v-col>
              <v-col
                v-if="page.newPassword && page.confirmPassword && (page.newPassword !== page.confirmPassword)"
                class="col=12 error--text" style="font-size: 12px;"
              >
                {{ $t('Password confirmation failed') }}
              </v-col>
            </v-row>
            <v-alert dense outlined text type="warning" v-if="page.setEmailMessage">
              {{ $t(page.setEmailMessage) }}
            </v-alert>
            <div class="text-right">
              <DefaultButton
                color="primary"
                :icon="conf.icon('Save')"
                :label="$t('Save')"
                @click="setEmailAndPasswordWithInvitation"
                :disabled="page.preview || !!state.waitProc || !page.newEmail || !page.confirmEmail || !page.setEmail || page.newEmail !== page.confirmEmail || page.newPassword !== page.confirmPassword"
              />
            </div>
          </v-form>
        </div>

        <v-divider class="my-2" />

        <SelectAuthProviders :noaction="page.preview" />

      </div>

      <UiPreferences :entity="state.me" v-if="me && me.valid" />
    </v-col>
  </v-row>
</template>

<script>
import { reactive, watch, onMounted } from '@vue/composition-api'
import { locales, menuPositions, timezones } from '../conf'
import { useStore } from '../store'
import { validateInvitation, setEmailAndPasswordWithInvitation } from '@/auth'
import PageTitle from '../components/PageTitle'
import Loading from '../components/Loading.vue'
import DefaultButton from '../components/DefaultButton'
import LinkButton from '../components/LinkButton'
import FormattedTextEditor from '../components/FormattedTextEditor'
import SelectAuthProviders from '../parts/SelectAuthProviders'
import Chats from '../parts/Chats'
import UiPreferences from '../parts/UiPreferences'

export default {
  name: 'PageInvitation',
  components: {
    PageTitle,
    Loading,
    DefaultButton,
    LinkButton,
    FormattedTextEditor,
    SelectAuthProviders,
    Chats,
    UiPreferences
  },
  setup (props) {
    const store = useStore()
    const { state, waitFor } = store
    const page = reactive({
      invitation: (state.route.params && state.route.params.invitation) ? state.route.params.invitation : '',
      error: '',
      setEmail: false,
      setEmailMessage: '',
      newEmail: '',
      confirmEmail: '',
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      preview: !state.route.params || !state.route.params.invitation
    })

    watch(
      () => state.route,
      () => {
        page.invitation = (state.route.params && state.route.params.invitation) ? state.route.params.invitation : ''
      }
    )

    onMounted(async () => {
      if (page.invitation) {
        const result = await validateInvitation(store, page.invitation)
        state.invitations[state.me.id] = page.invitation
        if (result.status !== 'ok') {
          page.error = 'System error'
        }
      }
    })

    return {
      page,
      ...store,
      setEmailAndPasswordWithInvitation: () => waitFor(async () => {
        try {
          page.setEmailMessage = 'Please wait'
          await setEmailAndPasswordWithInvitation(store, page)
          page.newEmail = ''
          page.confirmEmail = ''
          page.setEmailMessage = 'Completed'
        } catch (e) {
          page.setEmailMessage = 'System error'
        } finally {
          page.newPassword = ''
          page.confirmPassword = ''
          page.showNewPassword = false
          page.showConfirmPassword = false
          setTimeout(() => { page.setEmailMessage = '' }, 100 * 1000)
        }
      }),
      locales,
      menuPositions,
      timezones
    }
  }
}
</script>
