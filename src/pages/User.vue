<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <div v-if="user.id === state.me.id || priv.manager || priv.admin">
        <span class="float-sm-left mt-2 mr-2">{{ $t('Visible for') }}</span>
        <v-chip-group
          v-if="!edit"
          mandatory column
          active-class="info--text"
          v-model="page.preview"
        >
          <v-chip v-for="p in permissionList" :key="p.value">
            <v-icon>{{ p.icon }}</v-icon> {{ p.text }}
          </v-chip>
        </v-chip-group>
        <v-chip
          v-else
          v-for="p in permissionList" :key="p.value"
          outlined class="mt-2 mr-2"
        >
          <v-icon>{{ p.icon }}</v-icon> {{ p.text }}
        </v-chip>
      </div>
      <v-divider class="my-2" />
      <v-switch
        v-if="user.id === state.me.id || priv.manager || priv.admin"
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
            @save="val => set('users', user.id, { name: val })"
            :editable="edit && (priv.manager || user.id === state.me.id)"
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
      <div v-if="(!account.deletedAt) || (edit && priv.manager)">
        <GroupsOfUser class="mb-2" :id="user.id" :edit="edit" />
        <Profile :id="user.id" :edit="edit" :preview="preview" />
      </div>

      <div v-if="edit && priv.manager">

        <v-divider class="my-6" />
        <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
        <v-row>
          <v-col class="col-12 col-sm-6">
            <v-icon>{{ icon(accountStatus(state, account.id)) }}</v-icon>
            {{ $t(accountStatus(state, account.id)) }}
          </v-col>
          <v-col class="col-12 col-sm-6" v-if="accountIsValid(account)">
            <v-icon>{{ icon('Sign in') }}</v-icon>
            {{ $t('Sign in') }}:
            {{ account.signedInAt ? withTz(account.signedInAt).format('l') : '--/--/--' }}
          </v-col>
        </v-row>
        <div v-if="state.service.auth.invitation && account.valid">
          <ConfirmButton
            type="info"
            :title="$t('Invitation')"
            :iconProc="icon('Invitation')"
            :labelProc="$t('Invitation')"
            :message="$t('Confirm to invite', { name: user.name })"
            @confirm="invite(account.id)"
            :disabled="!!state.waitProc"
          />
          {{ account.invitedAt ? withTz(account.invitedAt).format('l') : '--/--/--' }}
          {{ account.invitedBy ? `( ${getById(state.users, account.invitedBy).name} )` : '' }}
        </div>
        <v-alert
          v-if="state.invitations[account.id] && invitationStatus === 'Sent'"
          type="info" outlined dense class="my-2" style="word-break: break-all;"
        >
          {{ $t('Send invitation', { url: topUrl().replace(/\/$/, '') + $router.resolve({ name: 'invitation', params: { invitation: state.invitations[account.id] } }).resolved.path }) }}
        </v-alert>

        <v-row>
          <v-col class="col-12 col-sm-7 my-2">
            <ConfirmButton
              v-if="account.valid"
              type="error"
              :title="$t('Revoke sign-in privilege')"
              :iconProc="icon('Lock')"
              :labelProc="$t('Lock')"
              :message="$t('Confirm to revoke sign-in privilege', { name: user.name })"
              @confirm="set('accounts', user.id, { valid: false })"
              :disabled="!!state.waitProc"
            />
            <ConfirmButton
              v-else
              type="warning"
              :title="$t('Grant sign-in privilege')"
              :iconProc="icon('Unlock')"
              :labelProc="$t('Unlock')"
              :message="$t('Confirm to grant sign-in privilege', { name: user.name })"
              @confirm="set('accounts', user.id, { valid: true })"
              :disabled="!!state.waitProc"
            />
          </v-col>
          <v-col class="col-12 col-sm-5 my-2">
            <ConfirmButton
              v-if="!account.deletedAt"
              type="error"
              :title="$t('Delete item', { name: user.name })"
              :iconProc="icon('Delete')"
              :labelProc="$t('Delete')"
              :message="$t('Confirm deletion', { name: user.name })"
              @confirm="del('accounts', user.id)"
              :disabled="!!state.waitProc"
            />
            <ConfirmButton
              v-else
              type="warning"
              :title="$t('Restore item', { name: user.name })"
              :iconProc="icon('Restore')"
              :labelProc="$t('Restore')"
              :message="$t('Confirm restore', { name: user.name })"
              @confirm="restore('accounts', user.id)"
              :disabled="!!state.waitProc"
            />
          </v-col>
        </v-row>

      </div>

    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed, watch } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { useStore, icon, getById, goPage } from '@/helpers'
import { permissions } from '@/conf/permissions'
import { invite } from '@/auth'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'
import ConfirmButton from '@/components/ConfirmButton'
import GroupsOfUser from '@/parts/GroupsOfUser'
import Profile from '@/pages/Profile'

export default {
  name: 'PageUser',
  components: {
    PageTitle,
    EditableItem,
    ConfirmButton,
    GroupsOfUser,
    Profile
  },
  setup (props, { root }) {
    const store = useStore()
    const { setProcForWait } = store
    const page = reactive({
      preview: 2
    })

    const user = computed(() => getById(store.state.users, root.$route.params.id))
    const account = computed(() => getById(store.state.accounts, root.$route.params.id))
    const profile = computed(() => getById(store.state.profiles, root.$route.params.id))
    const edit = computed({
      get: () => root.$route.params.mode === 'edit',
      set: edit => goPage(
        root.$router,
        { name: root.$route.name, params: { id: root.$route.params.id, mode: edit ? 'edit' : null } }
      )
    })

    const invitationStatus = computed(() => {
      const account = getById(store.state.accounts, root.$route.params.id)
      return account.invitedAt
        ? (account.signedInAt && account.invitedAt.getTime() < account.signedInAt.getTime())
          ? 'Accepted'
          : (account.invitedAt.getTime() >= (new Date().getTime() - store.state.service.conf.invitationExpirationTime))
            ? 'Sent'
            : 'Timeout'
        : ''
    })

    watch(() => root.$route, route => { page.preview = 2 })

    return {
      user,
      account,
      profile,
      edit,
      invitationStatus,
      page,
      permissionList: permissions.map(item => ({
        icon: icon(item.icon),
        value: item.value,
        text: root.$i18n.t(item.text)
      })),
      preview: computed(() => permissions[page.preview].value),
      ...store,
      invite: id => setProcForWait(() => invite(store, id)),
      ...helpers
    }
  }
}
</script>
