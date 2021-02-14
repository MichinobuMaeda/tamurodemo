<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <div v-if="id === state.me.id || priv.manager || priv.admin">
        <span class="float-sm-left mt-2 mr-2">{{ $t('Visible for') }}</span>
        <v-chip-group
          v-if="!edit"
          mandatory column
          active-class="info--text"
          v-model="preview"
        >
          <v-chip v-for="p in conf.permissions" :key="p.value">
            <v-icon>{{ icon(p.icon) }}</v-icon> {{ $t(p.text) }}
          </v-chip>
        </v-chip-group>
        <v-chip
          v-else
          v-for="p in conf.permissions" :key="p.value"
          outlined class="my-2 mr-2"
        >
          <v-icon>{{ icon(p.icon) }}</v-icon> {{ $t(p.text) }}
        </v-chip>
      </div>
      <v-divider class="my-2" />
      <v-switch
        v-if="id === state.me.id || priv.manager || priv.admin"
        color="primary"
        class="my-0 float-right"
        v-model="edit"
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
            @save="val => waitFor(() => update(user, { name: val }))"
            :editable="edit && (priv.manager || id === state.me.id)"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>
      <v-alert
        v-if="account.deletedAt"
        type="warning" text dense
      >
        {{ $t('This user is deleted.') }}
      </v-alert>

      <Chats
        class="my-2"
        :account="id"
        :height="state.chatPaneHeight"
      />

      <div v-if="(!account.deletedAt) || priv.manager">
        <GroupsOfUser class="mb-2" :id="id" :edit="edit" />
        <Profile :id="id" :edit="edit" :preview="conf.permissions[preview].value" />
      </div>

      <div v-if="priv.manager">

        <v-divider class="my-6" />
        <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
        <v-row>
          <v-col class="col-12 col-sm-6">
            <v-icon>{{ icon(accountStatus(id)) }}</v-icon>
            {{ $t(accountStatus(id)) }}
          </v-col>
          <v-col class="col-12 col-sm-6">
            <v-icon>{{ icon('Sign in') }}</v-icon>
            {{ $t('Sign in') }}:
            {{ account.signedInAt ? withTz(account.signedInAt).format('l') : '--/--/--' }}
          </v-col>
        </v-row>
        <div v-if="state.service.auth.invitation && account.valid && !account.deletedAt">
          <ConfirmButton
            type="info"
            :title="$t('Invitation')"
            :iconProc="icon('Invitation')"
            :labelProc="$t('Invitation')"
            :message="$t('Confirm to invite', { name: user.name })"
            @confirm="invite(id)"
            :disabled="!!state.waitProc"
          />
          {{ account.invitedAt ? withTz(account.invitedAt).format('l') : '--/--/--' }}
          {{ account.invitedBy ? `( ${nameOf(account.invitedBy)} )` : '' }}
        </div>
        <v-alert
          v-if="state.invitations[id] && invitationStatus === 'Sent'"
          type="info" outlined dense class="my-2" style="word-break: break-all;"
        >
          {{ $t('Send invitation', { url: invitationUrl(state, $router, id) }) }}
        </v-alert>

        <v-row>
          <v-col class="col-12 col-sm-8 my-1">
            <ConfirmButton
              type="error"
              :title="$t('Reset all sign-in settings')"
              :iconProc="icon('Reset all sign-in settings')"
              :labelProc="$t('Reset all sign-in settings')"
              :message="$t('Confirm to reset all sign-in settings', { name: user.name })"
              @confirm="resetAllSignInSettings(id)"
              :disabled="!!state.waitProc"
            />
          </v-col>
          <v-col class="col-12 col-sm-7 my-1">
            <ConfirmButton
              v-if="account.valid"
              type="error"
              :title="$t('Revoke sign-in privilege')"
              :iconProc="icon('Lock')"
              :labelProc="$t('Lock')"
              :message="$t('Confirm to revoke sign-in privilege', { name: user.name })"
              @confirm="waitFor(() => update(user, { valid: false }))"
              :disabled="!!state.waitProc"
            />
            <ConfirmButton
              v-else
              type="warning"
              :title="$t('Grant sign-in privilege')"
              :iconProc="icon('Unlock')"
              :labelProc="$t('Unlock')"
              :message="$t('Confirm to grant sign-in privilege', { name: user.name })"
              @confirm="waitFor(() => update(user, { valid: true }))"
              :disabled="!!state.waitProc"
            />
          </v-col>
          <v-col class="col-12 col-sm-5 my-1">
            <ConfirmButton
              v-if="!account.deletedAt"
              type="error"
              :title="$t('Delete item', { name: user.name })"
              :iconProc="icon('Delete')"
              :labelProc="$t('Delete')"
              :message="$t('Confirm deletion', { name: user.name })"
              @confirm="waitFor(() => remove(user))"
              :disabled="!!state.waitProc"
            />
            <ConfirmButton
              v-else
              type="warning"
              :title="$t('Restore item', { name: user.name })"
              :iconProc="icon('Restore')"
              :labelProc="$t('Restore')"
              :message="$t('Confirm restore', { name: user.name })"
              @confirm="waitFor(() => restore(user))"
              :disabled="!!state.waitProc"
            />
          </v-col>
        </v-row>

      </div>

    </v-col>
  </v-row>
</template>

<script>
import { computed, ref, watch } from '@vue/composition-api'
import * as conf from '@/conf'
import { useStore, findItem } from '@/store'
import { invite, invitationUrl, resetAllSignInSettings } from '@/auth'
import PageTitle from '../components/PageTitle'
import EditableItem from '../components/EditableItem'
import ConfirmButton from '../components/ConfirmButton'
import GroupsOfUser from '../parts/GroupsOfUser'
import Profile from '../parts/Profile'
import Chats from '../parts/Chats'

export default {
  name: 'PageUser',
  components: {
    PageTitle,
    EditableItem,
    ConfirmButton,
    GroupsOfUser,
    Profile,
    Chats
  },
  setup () {
    const store = useStore()
    const { state, waitFor, goPageUser } = store

    const preview = ref(2)
    const id = computed(() => state.route.params ? state.route.params.id : '')
    const account = computed(() => findItem(store.state.accounts, id.value))
    const user = computed(() => findItem(store.state.users, id.value))
    const profile = computed(() => findItem(store.state.profiles, id.value))

    watch(() => state.route, () => { preview.value = 2 })

    return {
      ...store,
      id,
      account,
      user,
      profile,
      edit: computed({
        get: () => state.route.params && state.route.params.mode === 'edit',
        set: edit => goPageUser(id.value, edit)
      }),
      conf,
      preview,
      invitationStatus: computed(() => {
        const invitedAt = account.value.invitedAt ? account.value.invitedAt.getTime() : 0
        const signedInAt = account.value.signedInAt ? account.value.signedInAt.getTime() : 0
        return invitedAt
          ? (signedInAt && invitedAt < signedInAt)
            ? 'Accepted'
            : (invitedAt >= (new Date().getTime() - state.service.conf.invitationExpirationTime))
              ? 'Sent'
              : 'Timeout'
          : ''
      }),
      invite: id => waitFor(() => invite(store, id)),
      invitationUrl,
      resetAllSignInSettings: id => waitFor(() => resetAllSignInSettings(store, id))
    }
  }
}
</script>
