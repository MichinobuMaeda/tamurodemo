<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="user.id === state.me.id || state.priv.manager || state.priv.admin"
        color="primary"
        class="float-right"
        v-model="page.edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('User')"
      >
        <template v-slot:title>
          <EditableItem
            :label="$t('Display name')"
            v-model="user.name"
            @save="val => set('users', user.id, { name: val })"
            :editable="page.edit && (state.priv.manager || user.id === state.me.id)"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>
      <GroupsOfUser class="mb-2" :id="user.id" :edit="page.edit" />
      <Profile :id="user.id" :edit="page.edit" />

      <div v-if="page.edit">
        <v-divider
          v-if="user.id === state.me.id || state.priv.manager || state.priv.admin"
          class="my-6"
        />
        <v-alert
          v-if="user.id !== state.me.id && (state.priv.manager || state.priv.admin)"
          type="info" text dense
        >
          {{ $t('Administrators only') }}
        </v-alert>
        <Preferences
          v-if="user.id === state.me.id || state.priv.manager || state.priv.admin"
          :id="user.id"
        />
        <ConfirmButton
          v-if="user.id === state.me.id"
          type="error"
          :title="$t('Sign out')"
          :iconProc="icon('Sign out')"
          :labelProc="$t('Sign out')"
          :message="$t('Confirm sign out')"
          @confirm="signOut"
          :disabled="!!state.waitProc"
        />

      </div>

    </v-col>
  </v-row>
</template>

<script>
import { reactive, watch } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'
import ConfirmButton from '@/components/ConfirmButton'
import GroupsOfUser from '@/views/GroupsOfUser'
import Preferences from '@/views/Preferences'
import Profile from '@/views/Profile'

const { useStore, signInUrl } = helpers

export default {
  name: 'PageUser',
  components: {
    PageTitle,
    EditableItem,
    ConfirmButton,
    GroupsOfUser,
    Preferences,
    Profile
  },
  setup (props, { root }) {
    const store = useStore()
    const { setProcForWait, auth } = store
    const page = reactive({
      edit: root.$route.params.mode === 'edit'
    })

    watch(
      () => root.$route.params.mode,
      mode => {
        page.edit = page.edit || mode === 'edit'
      }
    )

    const signOut = () => setProcForWait(
      async () => {
        await auth.signOut()
        page.confirmSginOut = false
        window.location.href = signInUrl()
      }
    )

    return {
      user: store.state.users.find(item => item.id === root.$route.params.id),
      page,
      ...store,
      signOut,
      ...helpers
    }
  }
}
</script>
