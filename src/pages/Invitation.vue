<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-alert
        v-if="!page.invitation && (priv.manager || priv.admin)"
        type="warning" outlined
      >
        <div>{{ $t('Administrators only') }}</div>
        <div>{{ $t("Don't touch buttons except 'edit'") }}</div>
      </v-alert>
      <v-switch
        v-if="!page.invitation && (priv.manager || priv.admin)"
        color="primary"
        class="float-right my-0"
        v-model="page.edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Guide')"
      >
        <template v-slot:title>{{ $t('Guide') }}</template>
      </PageTitle>

      <v-row>
        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="state.me.locale"
            :label="$t('Locale')"
            :items="locales"
            @change="set('accounts', state.me.id, { locale: state.me.locale })"
          />
        </v-col>

        <v-col class="col-12 col-sm-6">
          <v-select
            v-model="state.me.tz"
            :label="$t('Timezone')"
            :items="timezones"
            @change="set('accounts', state.me.id, { tz: state.me.tz })"
          />
        </v-col>
      </v-row>

      <div v-if="page.error">
        <v-alert type="error" outlined text class="mt-4">
          {{ $t('Invitation link authentication error') }}
        </v-alert>
      </div>
      <div v-else-if="!accountIsValid(state.me)">
        <v-alert type="info" outlined text class="mt-4">
          {{ $t('Please wait') }}
        </v-alert>
        <Loading color="h2" :size="96" />
      </div>
      <div v-else>
        <v-sheet
          v-if="page.edit || (state.service.conf.guide && state.service.conf.guide.data)"
          outlined rounded class="px-3 pt-3 mb-4"
        >
          <EditableItem
            type="formatted-text"
            :label="$t('Description')"
            v-model="state.service.conf.guide"
            @save="val => set('service', 'conf', { guide: val })"
            :editable="page.edit && (priv.manager || priv.admin)"
            :disabled="!!state.waitProc"
          />
        </v-sheet>
        <div v-if="state.me.email">
          <v-alert type="info" outlined dense>
            <div>{{ $t('E-mail address has been set') }}</div>
            <v-icon>{{ icon('E-mail') }}</v-icon> {{ state.me.email }}
            <div>{{ $t('Ask system admin to change e-mail') }}</div>
          </v-alert>
        </div>
        <div v-else>
          <v-form v-model="page.setEmail">
            <v-row>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.newEmail"
                  type="text"
                  :rules="[v => validateEmail(v) || $t('Invalid E-mail format')]"
                  :label="$t('E-mail')"
                ></v-text-field>
              </v-col>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.confirmEmail"
                  type="text"
                  :rules="[v => validateEmail(v) || $t('Invalid E-mail format')]"
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
                  :rules="[v => validatePassword(v) || $t('Invalid password')]"
                  :label="$t('Password')"
                  :append-icon="page.showNewPassword ? icon('Visible') : icon('Invisible')"
                  @click:append="page.showNewPassword = !page.showNewPassword"
                ></v-text-field>
              </v-col>
              <v-col class="col-12 col-sm-6">
                <v-text-field
                  v-model="page.confirmPassword"
                  :type="page.showConfirmPassword ? 'text' : 'password'"
                  :rules="[v => validatePassword(v) || $t('Invalid password')]"
                  :label="$t('Confirm password')"
                  :append-icon="page.showConfirmPassword ? icon('Visible') : icon('Invisible')"
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
              {{ page.setEmailMessage }}
            </v-alert>
            <div class="text-right">
              <DefaultButton
                color="primary"
                :icon="icon('Save')"
                :label="$t('Save')"
                @click="setEmail"
                :disabled="!!state.waitProc || !page.newEmail || !page.confirmEmail || !page.setEmail || page.newEmail !== page.confirmEmail || page.newPassword !== page.confirmPassword"
              />
            </div>
          </v-form>
        </div>
        <v-divider class="my-2" />
        <SelectAuthProviders />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, watch, onMounted } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { useStore } from '@/helpers'
import { locales } from '@/conf/locales'
import { timezones } from '@/conf/timezones'
import { updateMyEmail, validateInvitation } from '@/auth'
import PageTitle from '@/components/PageTitle'
import Loading from '@/components/Loading.vue'
import DefaultButton from '@/components/DefaultButton'
import EditableItem from '@/components/EditableItem'
import SelectAuthProviders from '@/parts/SelectAuthProviders'

export default {
  name: 'PageInvitation',
  components: {
    PageTitle,
    Loading,
    DefaultButton,
    EditableItem,
    SelectAuthProviders
  },
  setup (props, { root }) {
    const store = useStore()
    const { setProcForWait } = store
    const page = reactive({
      edit: false,
      invitation: root.$route.params.invitation || '',
      error: '',
      setEmail: false,
      setEmailMessage: '',
      newEmail: '',
      confirmEmail: '',
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false
    })

    watch(
      () => root.$route,
      route => {
        page.invitation = route.params.invitation || ''
      }
    )

    onMounted(async () => {
      if (page.invitation) {
        const result = await validateInvitation(store, page.invitation)
        if (result.status !== 'ok') {
          page.error = 'System error'
        }
      }
    })

    const setEmail = () => setProcForWait(
      async () => {
        try {
          await updateMyEmail(store, page.newEmail)

          page.newEmail = ''
          page.confirmEmail = ''
          page.newPassword = ''
          page.confirmPassword = ''
          page.showNewPassword = false
          page.showConfirmPassword = false
          page.setEmailMessage = root.$i18n.t('Completed')
        } catch (e) {
          page.setEmailMessage = root.$i18n.t('System error')
        } finally {
          setTimeout(() => { page.setEmailMessage = '' }, 100 * 1000)
        }
      }
    )

    return {
      page,
      ...store,
      setEmail,
      locales,
      timezones,
      ...helpers
    }
  }
}
</script>
