<template>
  <v-dialog
    max-width="640px"
    v-model="dialog"
    @click:outside="$emit('dialogChange', false)"
    @keydown.esc="$emit('dialogChange', false)"
  >
    <v-card>
      <v-card-title>
        <span class="h2--text text-h2">
          <v-icon large color="h2">{{ icon('Preferences') }}</v-icon>
          {{ $t('Preferences') }}
        </span>
        <v-spacer />
        <v-btn icon @click="$emit('dialogChange', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-switch
          v-model="account.darkTheme"
          :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
          @change="set('accounts', account.id, { darkTheme: account.darkTheme })"
        />
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
        <v-select
          v-model="account.locale"
          :label="$t('Locale')"
          :items="locales"
          @change="set('accounts', account.id, { locale: account.locale })"
        />
        <v-select
          v-model="account.tz"
          :label="$t('Timezone')"
          :items="timezones"
          @change="set('accounts', account.id, { tz: account.tz })"
        />

        <p>{{ withTz(page.now).format('llll') }}</p>

        <ConfirmButton
          v-if="id === state.me.id"
          type="error"
          :title="$t('Sign out')"
          :iconProc="icon('Sign out')"
          :labelProc="$t('Sign out')"
          :message="$t('Confirm sign out')"
          @confirm="signOut"
          :disabled="!!state.waitProc"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { computed, reactive, onMounted, onUnmounted } from '@vue/composition-api'
import * as helpers from '@/helpers'
import ConfirmButton from '@/components/ConfirmButton'

const { useStore, getById, signInUrl } = helpers

export default {
  name: 'Preferences',
  components: {
    ConfirmButton
  },
  model: {
    prop: 'dialog',
    event: 'dialogChange'
  },
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    id: String
  },
  setup (props, { root }) {
    const store = useStore()
    const { auth, setProcForWait } = store
    const page = reactive({
      now: new Date().getTime(),
      secondaryUpdater: null
    })

    onMounted(
      () => {
        page.secondaryUpdater = setInterval(
          () => { page.now = new Date().getTime() },
          1000
        )
      }
    )

    onUnmounted(() => { clearInterval(page.secondaryUpdater) })

    const signOut = () => setProcForWait(
      async () => {
        await auth.signOut()
        page.confirmSginOut = false
        window.location.href = signInUrl()
      }
    )

    return {
      account: computed(() => getById(store.state.accounts, props.id)),
      page,
      ...store,
      signOut,
      ...helpers
    }
  }
}
</script>
