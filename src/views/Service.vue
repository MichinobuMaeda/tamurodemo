<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Service settings')"
      >
        <template v-slot:title>{{ $t('Service settings') }}</template>
      </PageTitle>
      <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Site name') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Site name')"
            v-model="state.service.conf.name"
            :rules="rulesRequired"
            @save="val => set('service', 'conf', { name: val })"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">URL</v-col>
        <v-col class="col-8">
          <EditableItem
            label="URL"
            v-model="state.service.conf.hosting"
            :rules="rulesURL"
            @save="val => set('service', 'conf', { hosting: val })"
            :editable="priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Invitation') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Invitation')"
            :items="[{ text: $t('Enabled'), value: true }, { text: $t('Disabled'), value: false }]"
            v-model="state.service.auth.invitation"
            @save="val => set('service', 'auth', { invitation: val })"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row v-if="state.service.auth.invitation">
        <v-col class="title--text col-4 text-right">{{ $t('Invitation expiration') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Invitation expiration')"
            v-model="invExp"
            :rules="rulesDaysAndTime"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">API key</v-col>
        <v-col class="col-8">
          <EditableItem
            label="API key"
            v-model="state.service.conf.apiKey"
            :rules="rulesRequired"
            @save="val => set('service', 'conf', { apiKey: val })"
            :editable="priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ icon('Defaults') }}</v-icon>
        {{ $t('Defaults') }}
      </p>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Dark theme') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Dark theme')"
            v-model="state.service.defaults.darkTheme"
            :items="[{ text: 'On', value: true }, { text: 'Off', value: false }]"
            @save="val => set('service', 'defaults', { darkTheme: val })"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Menu position') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Menu position')"
            v-model="state.service.defaults.menuPosition"
            :items="menuPositions.map(item => ({ ...item, text: $t(item.text) }))"
            @save="val => set('service', 'defaults', { menuPosition: val })"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Locale') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Locale')"
            v-model="state.service.defaults.locale"
            :items="locales"
            @save="val => set('service', 'defaults', { locale: val })"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Timezone') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Timezone')"
            v-model="state.service.defaults.tz"
            :items="timezones"
            @save="val => set('service', 'defaults', { tz: val })"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ icon('Sign in') }}</v-icon>
        {{ $t('Authentication') }}
      </p>
      <v-row v-for="provider in providers.filter(provider => ['oauth', 'custom'].includes(provider.type))" :key="provider.id">
        <v-col class="title--text col-4 text-right">{{ provider.name }}</v-col>
        <v-col class="col-8">
          <EditableItem
            v-if="provider.type === 'oauth'"
            type="select"
            :label="provider.name"
            v-model="state.service.auth[provider.id]"
            :items="[{ text: $t('Enabled'), value: true }, { text: $t('Disabled'), value: false }]"
            @save="val => set('service', 'auth', { [provider.id]: val })"
            :editable="priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>

    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { menuPositions } from '@/conf/menuPositions'
import { locales } from '@/conf/locales'
import { timezones } from '@/conf/timezones'
import { authProviders } from '@/auth'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'

const { useStore, validateURL, validateRequired } = helpers

export default {
  name: 'PageService',
  components: {
    PageTitle,
    EditableItem
  },
  setup (prop, { root }) {
    const store = useStore()
    const { set } = store
    const page = reactive({
      name: store.state.service.conf.name,
      hosting: store.state.service.conf.hosting,
      locale: store.state.service.defaults.locale,
      menuPosition: store.state.service.defaults.menuPosition,
      tz: store.state.service.defaults.tz
    })

    const invExtTime = invExp => {
      const str = (invExp || '').trim()
      const dt = (/ /.test(str) ? str.replace(/ .*/, '') : (/:/.test(str) ? '' : str)) || '0'
      const tm = (/ /.test(str) ? str.replace(/.* /, '') : (/:/.test(str) ? str : '')) || '0:00'
      return Number(dt) * 24 * 60 * 60 * 1000 +
        new Date('1970-01-01 ' + tm).getTime() - new Date('1970-01-01T00:00:00').getTime()
    }

    return {
      ...store,
      page,
      invExp: computed({
        get: () => {
          const t = store.state.service.conf.invitationExpirationTime
          const d = Math.floor(t / (24 * 60 * 60 * 1000))
          return `${d} ${new Date(t % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
        },
        set: str => set('service', 'conf', { invitationExpirationTime: invExtTime(str) })
      }),
      rulesURL: [
        v => !!v || root.$i18n.t('Required'),
        v => validateURL(v) || root.$i18n.t('Invalid URL format')
      ],
      rulesRequired: [
        v => validateRequired(v) || root.$i18n.t('Required')
      ],
      rulesDaysAndTime: [
        v => invExtTime(v) > 0 || '"d" or "h:mm:ss" or  "d h:mm:ss"'
      ],
      providers: authProviders(store, root.$route),
      menuPositions,
      locales,
      timezones,
      ...helpers
    }
  }
}
</script>
