<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <div v-if="id === me.id || me.priv.manager">
        <span class="float-sm-left mt-2 mr-2">{{ $t('Visible for') }}</span>
        <v-chip-group
          v-if="!edit"
          mandatory column
          active-class="info--text"
          v-model="preview"
        >
          <v-chip v-for="p in conf.permissions" :key="p.value">
            <v-icon>{{ conf.icon(p.icon) }}</v-icon> {{ $t(p.text) }}
          </v-chip>
        </v-chip-group>
        <v-chip
          v-else
          v-for="p in conf.permissions" :key="p.value"
          outlined class="my-2 mr-2"
        >
          <v-icon>{{ conf.icon(p.icon) }}</v-icon> {{ $t(p.text) }}
        </v-chip>
      </div>
      <v-divider class="my-2" />
      <v-switch
        v-if="id === me.id || me.priv.manager"
        color="primary"
        class="my-0 float-right"
        v-model="edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="conf.icon('User')"
      >
        <template v-slot:title>
          <EditableItem
            :label="$t('Display name')"
            v-model="name"
            :editable="edit && (me.priv.manager || id === me.id)"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>
      <v-alert
        v-if="account(id).deletedAt"
        type="warning" text dense
      >
        {{ $t('This user is deleted.') }}
      </v-alert>

      <Chats
        class="my-2"
        :accountId="id"
        :height="state.chatPaneHeight"
      />

      <div v-if="(!account(id).deletedAt) || me.priv.manager">
        <GroupsOfUser class="mb-2" :id="id" :edit="edit" />
        <Profile :id="id" :edit="edit" :preview="conf.permissions[preview].value" />
      </div>

      <Account :id="id" v-if="me.priv.manager" />

    </v-col>
  </v-row>
</template>

<script>
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import { useStore, firestoreTimestampToDate } from '@/store'
import PageTitle from '../components/PageTitle'
import EditableItem from '../components/EditableItem'
import GroupsOfUser from '../parts/GroupsOfUser'
import Profile from '../parts/Profile'
import Chats from '../parts/Chats'
import Account from '../parts/admin/Account'

export default {
  name: 'PageUser',
  components: {
    PageTitle,
    EditableItem,
    GroupsOfUser,
    Profile,
    Chats,
    Account
  },
  setup (props, { root }) {
    const store = useStore()
    const { functions, state, account, waitFor, update, goPage, goPageUser, user, profile } = store

    const preview = ref(2)
    const id = computed(() => root.$route.params ? root.$route.params.id : '')

    const pageHook = async () => {
      const id = root.$route.params ? root.$route.params.id : ''
      if (!user(id).id) {
        goPage({ name: 'top' })
      }
      preview.value = 2
      if (!(id === state.me.id || account(state.me.id).priv.manager) && !profile(id).id) {
        const result = await functions.httpsCallable('getProfile')({ id })
        state.profiles = [
          ...state.profiles.filter(item => item.id !== id),
          firestoreTimestampToDate(result.data)
        ]
      }
    }

    watch(() => root.$route.params, pageHook)
    onMounted(pageHook)

    return {
      ...store,
      id,
      edit: computed({
        get: () => state.route.params && state.route.params.mode === 'edit',
        set: edit => goPageUser(id.value, edit)
      }),
      name: computed({
        get: () => user(id.value).name,
        set: val => waitFor(() => update(user(id.value), { name: val }))
      }),
      preview
    }
  }
}
</script>
