<template>
  <v-row>
    <v-col class="col-12 col-sm-6">
      <v-switch
        v-model="darkTheme"
        :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
      />
    </v-col>

    <v-col class="col-12 col-sm-6">
      <v-select
        v-model="menuPosition"
        :label="$t('Menu position')"
        :items="conf.menuPositions"
      >
        <template slot="selection" slot-scope="data">
          <v-icon>{{ conf.icon(data.item.text) }}</v-icon>
          {{ $t(data.item.text) }}
        </template>
        <template slot="item" slot-scope="data">
          <v-icon>{{ conf.icon(data.item.text) }}</v-icon>
          {{ $t(data.item.text) }}
        </template>
      </v-select>

    </v-col>

    <v-col class="col-12 col-sm-6">
      <v-select
        v-model="locale"
        :label="$t('Locale')"
        :items="conf.locales"
      />
    </v-col>

    <v-col class="col-12 col-sm-6">
      <v-select
        v-model="tz"
        :label="$t('Timezone')"
        :items="conf.timezones"
      />
    </v-col>

    <v-col class="col-12 text-right">
      <div>{{ withTz(page.now).format('llll') }}</div>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed, onMounted, onUnmounted } from '@vue/composition-api'
import { useStore } from '../store'

export default {
  name: 'UiPreferences',
  props: {
    entity: Object
  },
  setup (props) {
    const store = useStore()
    const { waitFor, update } = store
    const page = reactive({
      now: new Date().getTime(),
      everySecondUpdater: null
    })

    onMounted(() => { page.everySecondUpdater = setInterval(() => { page.now = new Date().getTime() }, 1000) })
    onUnmounted(() => { clearInterval(page.everySecondUpdater) })

    return {
      page,
      ...store,
      darkTheme: computed({
        get: () => props.entity.darkTheme,
        set: val => waitFor(() => update(props.entity, { darkTheme: val }))
      }),
      menuPosition: computed({
        get: () => props.entity.menuPosition,
        set: val => waitFor(() => update(props.entity, { menuPosition: val }))
      }),
      locale: computed({
        get: () => props.entity.locale,
        set: val => waitFor(() => update(props.entity, { locale: val }))
      }),
      tz: computed({
        get: () => props.entity.tz,
        set: val => waitFor(() => update(props.entity, { tz: val }))
      })
    }
  }
}
</script>
