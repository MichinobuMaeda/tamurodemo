<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :title="$t('Profile and Settings', { user: myName })"
        :icon="icon('Profile and Settings')"
      />
      <v-row>
        <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
          <v-switch
            v-model="state.me.darkTheme"
            :label="$t('Dark theme value', { on: $vuetify.theme.dark ? 'On' : 'Off' })"
            @change="set('accounts', state.me.id, { darkTheme: state.me.darkTheme })"
          />
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
          <v-select
            v-model="state.me.menuPosition"
            :label="$t('Menu position')"
            :items="menuPositions"
            @change="set('accounts', state.me.id, { menuPosition: state.me.menuPosition })"
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
            v-model="state.me.locale"
            :label="$t('Locale')"
            :items="locales"
            @change="set('accounts', state.me.id, { locale: state.me.locale })"
          />
        </v-col>
        <v-col class="col-12 col-sm-6 col-md-6 col-lg-6">
          <v-select
            v-model="state.me.tz"
            :label="$t('Timezone')"
            :items="timezones"
            @change="set('accounts', state.me.id, { tz: state.me.tz })"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col class="title--text col-4">{{ $t('Display name') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="text"
            :label="$t('Display name')"
            v-model="state.users.find(user => user.id === state.me.id).name"
            :rules="rulesName"
            @save="val => set('users', state.me.id, { name: val })"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-divider />

      <div v-if="!page.confirmSginOut" class="mt-4">
        <ButtonNegative
          :label="$t('Sign out')"
          :icon="icon('Sign out')"
          @click="() => { page.confirmSginOut = true }"
        />
      </div>
      <div v-else>
        <v-alert type="error" dense outlined>
          {{ $t('Confirm sign out') }}
        </v-alert>
        <v-row>
          <v-col>
            <ButtonSecondary
              :label="$t('Cancel')"
              :icon="icon('Cancel')"
              @click="() => { page.confirmSginOut = false }"
            />
          </v-col>
          <v-col class="text-right">
            <ButtonNegative
              :label="$t('Sign out')"
              :icon="icon('Sign out')"
              @click="signOut"
              :disabled="!!state.waitProc"
            />
          </v-col>
        </v-row>
      </div>

    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import ButtonSecondary from '@/components/ButtonSecondary'
import ButtonNegative from '@/components/ButtonNegative'
import EditableItem from '@/components/EditableItem'

const { useStore, signInUrl } = helpers

export default {
  name: 'PageMe',
  components: {
    PageTitle,
    ButtonSecondary,
    ButtonNegative,
    EditableItem
  },
  setup (proc, { root }) {
    const store = useStore()
    const { setProcForWait, auth } = store
    const page = reactive({
      confirmSginOut: false
    })

    const signOut = () => setProcForWait(
      async () => {
        await auth.signOut()
        page.confirmSginOut = false
        window.location.href = signInUrl()
      }
    )

    return {
      ...store,
      page,
      signOut,
      rulesName: [
        v => !!v || root.$i18n.t('Required')
      ],
      myInfo: computed(() => store.state.users.find(item => item.id === store.state.me.id)),
      myProfile: computed(() => store.state.profiles.find(item => item.id === store.state.me.id)),
      ...helpers
    }
  }
}
</script>
