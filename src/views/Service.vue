<template>
  <v-row justify="center">
    <v-col sm="10" md="8">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :title="$t('Service settings')"
        :icon="icon('Service settings')"
      />
      <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
      <v-row>
        <v-col class="title--text' col-4">Version</v-col>
        <v-col class="col-6">{{ state.service.conf.version }}</v-col>
        <v-col class="col-2 text-right">
          <MiniButton
            v-if="priv.admin"
            :icon="icon('Update service')"
            :disabled="!!state.waitProc"
            @click="updateServiceVersion"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text' col-4">URL</v-col>
        <v-col class="col-8">
          <EditableText
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.admin"
            :disabled="!!state.waitProc"
            v-model="state.service.conf.hosting"
            :rules="rulesURL"
            @save="val => set('service', 'conf', { hosting: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text' col-4">{{ $t('Site name') }}</v-col>
        <v-col class="col-8">
          <EditableText
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
            v-model="state.service.conf.name"
            :rules="rulesName"
            @save="val => set('service', 'conf', { name: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <p class="h3--text text-h6 pt-6">
        <v-icon color="h3">{{ icon('Defaults') }}</v-icon>
        {{ $t('Defaults') }}
      </p>
      <v-row>
        <v-col class="title--text' col-4">{{ $t('Dark theme') }}</v-col>
        <v-col class="col-8">
          <EditableSwitch
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
            v-model="state.service.defaults.darkTheme"
            :items="[{ text: 'On', value: true }, { text: 'Off', value: false }]"
            @save="val => set('service', 'defaults', { darkTheme: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text' col-4">{{ $t('Menu position') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
            v-model="state.service.defaults.menuPosition"
            :items="menuPositions.map(item => ({ ...item, text: $t(item.text) }))"
            @save="val => set('service', 'defaults', { menuPosition: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text' col-4">{{ $t('Locale') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
            v-model="state.service.defaults.locale"
            :items="locales"
            @save="val => set('service', 'defaults', { locale: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col class="title--text' col-4">{{ $t('Timezone') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
            v-model="state.service.defaults.tz"
            :items="timezones"
            @save="val => set('service', 'defaults', { tz: val })"
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
import MiniButton from '@/components/MiniButton'
import EditableText from '@/components/EditableText'
import EditableSelect from '@/components/EditableSelect'
import EditableSwitch from '@/components/EditableSwitch'

const { useStore, validateURL } = helpers

export default {
  name: 'PageService',
  components: {
    PageTitle,
    MiniButton,
    EditableText,
    EditableSelect,
    EditableSwitch
  },
  setup(prop, { root }) {
    const store = useStore()
    const { functions, setProcForWait } = store

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
      rulesName: [
        v => !!v || root.$i18n.t('Required')
      ],
      updateServiceVersion: () => setProcForWait(
        () => functions.httpsCallable("updateServiceVersion").call()
      ),
      ...helpers
    }
  }
}
</script>
