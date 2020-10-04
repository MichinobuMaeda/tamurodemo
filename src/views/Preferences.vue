<template>
  <div>
    <p class="h3--text text-h3 pt-6">
      <v-icon color="h3">{{ icon('Preferences') }}</v-icon>
      {{ $t('Preferences') }}
    </p>
    <v-row>
      <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
        <v-switch
          v-model="account.darkTheme"
          :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
          @change="set('accounts', account.id, { darkTheme: account.darkTheme })"
        />
      </v-col>
      <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
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
      </v-col>
      <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
        <v-select
          v-model="account.locale"
          :label="$t('Locale')"
          :items="locales"
          @change="set('accounts', account.id, { locale: account.locale })"
        />
      </v-col>
      <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
        <v-select
          v-model="account.tz"
          :label="$t('Timezone')"
          :items="timezones"
          @change="set('accounts', account.id, { tz: account.tz })"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
import * as helpers from '@/helpers'

const { useStore, getById } = helpers

export default {
  name: 'Preferences',
  props: {
    id: String
  },
  setup (props, { root }) {
    const store = useStore()

    return {
      account: computed(() => getById(store.state.accounts, props.id)),
      ...store,
      ...helpers
    }
  }
}
</script>
