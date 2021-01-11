<template>
  <v-row justify="center">
    <v-col class="col-12">
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Dark theme') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Dark theme')"
            v-model="state.service.defaults.darkTheme"
            :items="[{ text: 'On', value: true }, { text: 'Off', value: false }]"
            @save="val => waitForUpdate('service', 'defaults', { darkTheme: val })"
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
            @save="val => waitForUpdate('service', 'defaults', { menuPosition: val })"
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
            @save="val => waitForUpdate('service', 'defaults', { locale: val })"
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
            @save="val => waitForUpdate('service', 'defaults', { tz: val })"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { locales, menuPositions, timezones } from '../../conf'
import { useStore } from '../../store'
import EditableItem from '../../components/EditableItem'

export default {
  name: 'SectionDefaults',
  components: {
    EditableItem
  },
  setup (prop, { root }) {
    const store = useStore()
    const page = reactive({
      locale: store.state.service.defaults.locale,
      menuPosition: store.state.service.defaults.menuPosition,
      tz: store.state.service.defaults.tz
    })

    return {
      ...store,
      page,
      locales,
      menuPositions,
      timezones
    }
  }
}
</script>
