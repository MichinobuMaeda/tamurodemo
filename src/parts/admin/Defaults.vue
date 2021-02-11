<template>
  <v-row justify="center">
    <v-col class="col-12">
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Dark theme') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Dark theme')"
            v-model="darkTheme"
            :items="[{ text: 'On', value: true }, { text: 'Off', value: false }]"
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
            v-model="menuPosition"
            :items="menuPositions.map(item => ({ ...item, text: $t(item.text) }))"
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
            v-model="locale"
            :items="locales"
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
            v-model="tz"
            :items="timezones"
            :editable="priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { locales, menuPositions, timezones } from '../../conf'
import { useStore } from '../../store'
import EditableItem from '../../components/EditableItem'

export default {
  name: 'SectionDefaults',
  components: {
    EditableItem
  },
  setup () {
    const store = useStore()
    const { state, waitFor, update } = store

    return {
      ...store,
      darkTheme: computed({
        get: () => state.service.defaults.darkTheme,
        set: str => waitFor(() => update(state.service.defaults, { darkTheme: str }))
      }),
      menuPosition: computed({
        get: () => state.service.defaults.menuPosition,
        set: str => waitFor(() => update(state.service.defaults, { menuPosition: str }))
      }),
      locale: computed({
        get: () => state.service.defaults.locale,
        set: str => waitFor(() => update(state.service.defaults, { locale: str }))
      }),
      tz: computed({
        get: () => state.service.defaults.tz,
        set: str => waitFor(() => update(state.service.defaults, { tz: str }))
      }),
      locales,
      menuPositions,
      timezones
    }
  }
}
</script>
