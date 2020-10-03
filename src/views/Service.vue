<template>
  <v-row justify="center">
    <v-col sm="10" md="8">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Service settings')"
      >
        <template v-slot:title>{{ $t('Service settings') }}</template>
      </PageTitle>
      <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
      <v-row>
        <v-col class="title--text col-4">API key</v-col>
        <v-col class="col-8">
          <editable-item
            label="API key"
            v-model="state.service.conf.apiKey"
            :rules="rulesRequired"
            @save="val => set('service', 'conf', { apiKey: val })"
            :editable="state.priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text col-4">URL</v-col>
        <v-col class="col-8">
          <editable-item
            label="URL"
            v-model="state.service.conf.hosting"
            :rules="rulesURL"
            @save="val => set('service', 'conf', { hosting: val })"
            :editable="state.priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text col-4">{{ $t('Site name') }}</v-col>
        <v-col class="col-8">
          <editable-item
            :label="$t('Site name')"
            v-model="state.service.conf.name"
            :rules="rulesRequired"
            @save="val => set('service', 'conf', { name: val })"
            :editable="state.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />
      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ icon('Defaults') }}</v-icon>
        {{ $t('Defaults') }}
      </p>
      <v-row>
        <v-col class="title--text col-4">{{ $t('Dark theme') }}</v-col>
        <v-col class="col-8">
          <editable-item
            type="select"
            :label="$t('Dark theme')"
            v-model="state.service.defaults.darkTheme"
            :items="[{ text: 'On', value: true }, { text: 'Off', value: false }]"
            @save="val => set('service', 'defaults', { darkTheme: val })"
            :editable="state.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text col-4">{{ $t('Menu position') }}</v-col>
        <v-col class="col-8">
          <editable-item
            type="select"
            :label="$t('Menu position')"
            v-model="state.service.defaults.menuPosition"
            :items="menuPositions.map(item => ({ ...item, text: $t(item.text) }))"
            @save="val => set('service', 'defaults', { menuPosition: val })"
            :editable="state.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text col-4">{{ $t('Locale') }}</v-col>
        <v-col class="col-8">
          <editable-item
            type="select"
            :label="$t('Locale')"
            v-model="state.service.defaults.locale"
            :items="locales"
            @save="val => set('service', 'defaults', { locale: val })"
            :editable="state.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text col-4">{{ $t('Timezone') }}</v-col>
        <v-col class="col-8">
          <editable-item
            type="select"
            :label="$t('Timezone')"
            v-model="state.service.defaults.tz"
            :items="timezones"
            @save="val => set('service', 'defaults', { tz: val })"
            :editable="state.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />

    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
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
    // const { functions, setProcForWait } = store

    const page = reactive({
      name: store.state.service.conf.name,
      hosting: store.state.service.conf.hosting,
      locale: store.state.service.defaults.locale,
      menuPosition: store.state.service.defaults.menuPosition,
      tz: store.state.service.defaults.tz
    })

    return {
      ...store,
      page,
      rulesURL: [
        v => !!v || root.$i18n.t('Required'),
        v => validateURL(v) || root.$i18n.t('Invalid URL format')
      ],
      rulesRequired: [
        v => validateRequired(v) || root.$i18n.t('Required')
      ],
      // updateServiceVersion: () => setProcForWait(
      //   () => functions.httpsCallable('updateServiceVersion').call()
      // ),
      ...helpers
    }
  }
}
</script>
