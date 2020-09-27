<template>
  <v-row justify="center">
    <v-col sm="10" md="8">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Service settings')"
        :icon="icon('Service settings')"
      />
      <v-row>
        <v-col :class="state.color.pageTitle + ' col-4'">Version</v-col>
        <v-col class="col-6">{{ state.service.conf.version }}</v-col>
        <v-col class="col-2 text-right">
          <MiniButton
            v-if="isAdmin(state)"
            :icon="icon('Update service')"
            @click="waitProc(state, updateServiceVersion)"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="state.color.pageTitle + ' col-4'">URL</v-col>
        <v-col class="col-8">
          <EditableText
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="isAdmin(state)"
            v-model="state.service.conf.hosting"
            :rules="[
              v => !!v || $t('Required'),
              v => validateURL(v) || $t('Invalid URL format')
            ]"
            @save="val => waitProc(state, () => updateServiceConf('hosting', val))"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="state.color.pageTitle + ' col-4'">{{ $t('Site name') }}</v-col>
        <v-col class="col-8">
          <EditableText
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="isManager(state)"
            v-model="state.service.conf.name"
            :rules="[v => !!v || $t('Required')]"
            @save="val => waitProc(state, () => updateServiceConf('name', val))"
          />
        </v-col>
      </v-row>
      <v-divider />
      <p :class="state.color.pageTitle + ' text-h6 pt-6'">
        <v-icon :color="state.color.pageIcon">{{ icon('Defaults') }}</v-icon>
        {{ $t('Defaults') }}
      </p>
      <v-row>
        <v-col :class="state.color.pageTitle + ' col-4'">{{ $t('Menu position') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="isManager(state)"
            v-model="state.service.defaults.menuPosition"
            :items="menuPositions.map(item => ({ ...item, text: $t(item.text) }))"
            @save="val => waitProc(state, () => updateServiceDefaults('menuPosition', val))"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="state.color.pageTitle + ' col-4'">{{ $t('Locale') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="isManager(state)"
            v-model="state.service.defaults.locale"
            :items="locales"
            @save="val => waitProc(state, () => updateServiceDefaults('locale', val))"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="state.color.pageTitle + ' col-4'">{{ $t('Timezone') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="isManager(state)"
            v-model="state.service.defaults.tz"
            :items="timezones"
            @save="val => waitProc(state, () => updateServiceDefaults('tz', val))"
          />
        </v-col>
      </v-row>
      <v-divider />

    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import MiniButton from '../components/MiniButton'
import EditableText from '../components/EditableText'
import EditableSelect from '../components/EditableSelect'
import menuPositions from '../conf/menuPositions'
import locales from '../conf/locales'
import timezones from '../conf/timezones'

export default {
  name: 'PageService',
  components: {
    PageTitle,
    MiniButton,
    EditableText,
    EditableSelect
  },
  setup() {
    const store = useStore()
    const temp = reactive({
      name: store.state.service.conf.name,
      hosting: store.state.service.conf.hosting,
      locale: store.state.service.defaults.locale,
      menuPosition: store.state.service.defaults.menuPosition,
      tz: store.state.service.defaults.tz
    })

    return {
      temp,
      ...store,
      menuPositions,
      locales,
      timezones
    }
  }
}
</script>
