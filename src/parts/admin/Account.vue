<template>
  <v-card>
    <v-card-title class="pa-0">
      <v-alert type="info" text dense width="100%">{{ $t('Administrators only') }}</v-alert>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col class="col-12 col-sm-6">
          <v-icon>{{ conf.icon(account(id).status) }}</v-icon>
          {{ $t(account(id).status) }}
        </v-col>
        <v-col class="col-12 col-sm-6">
          <v-icon>{{ conf.icon('Sign in') }}</v-icon>
          {{ $t('Sign in') }}:
          {{ account(id).signedInAt ? withTz(account(id).signedInAt).format('l') : '--/--/--' }}
        </v-col>
      </v-row>
      <div
        v-if="state.service.auth.invitation && account(id).valid && !account(id).deletedAt"
        class="my-2"
      >
        <ConfirmButton
          type="info"
          :title="$t('Invitation')"
          :iconProc="conf.icon('Invitation')"
          :labelProc="$t('Invitation')"
          :message="$t('Confirm to invite', { name: user(id).name })"
          @confirm="invite"
          :disabled="!!state.waitProc"
        />
        {{ account(id).invitedAt ? withTz(account(id).invitedAt).format('l') : '--/--/--' }}
        {{ account(id).invitedBy ? `( ${account(account(id).invitedBy).name} )` : '' }}
      </div>
      <v-alert
        v-if="state.invitations[id] && invitationStatus(account(id)) === 'Sent'"
        type="info" outlined dense class="my-2" style="word-break: break-all;"
      >
        {{ $t('Send invitation', { url: invitationUrl(state, $router, id) }) }}
      </v-alert>

      <v-row>
        <v-col class="col-12 col-sm-8 my-1">
          <ConfirmButton
            type="error"
            :title="$t('Reset all sign-in settings')"
            :iconProc="conf.icon('Reset all sign-in settings')"
            :labelProc="$t('Reset all sign-in settings')"
            :message="$t('Confirm to reset all sign-in settings', { name: user(id).name })"
            @confirm="resetAllSignInSettings"
            :disabled="!!state.waitProc"
          />
        </v-col>
        <v-col class="col-12 col-sm-7 my-1">
          <ConfirmButton
            v-if="account(id).valid"
            type="error"
            :title="$t('Revoke sign-in privilege')"
            :iconProc="conf.icon('Lock')"
            :labelProc="$t('Lock')"
            :message="$t('Confirm to revoke sign-in privilege', { name: user(id).name })"
            @confirm="waitFor(() => update(account(id), { valid: false }))"
            :disabled="!!state.waitProc"
          />
          <ConfirmButton
            v-else
            type="warning"
            :title="$t('Grant sign-in privilege')"
            :iconProc="conf.icon('Unlock')"
            :labelProc="$t('Unlock')"
            :message="$t('Confirm to grant sign-in privilege', { name: user(id).name })"
            @confirm="waitFor(() => update(account(id), { valid: true }))"
            :disabled="!!state.waitProc"
          />
        </v-col>
        <v-col class="col-12 col-sm-5 my-1">
          <ConfirmButton
            v-if="!account(id).deletedAt"
            type="error"
            :title="$t('Delete item', { name: user(id).name })"
            :iconProc="conf.icon('Delete')"
            :labelProc="$t('Delete')"
            :message="$t('Confirm deletion', { name: user(id).name })"
            @confirm="waitFor(() => remove(account(id)))"
            :disabled="!!state.waitProc"
          />
          <ConfirmButton
            v-else
            type="warning"
            :title="$t('Restore item', { name: user(id).name })"
            :iconProc="conf.icon('Restore')"
            :labelProc="$t('Restore')"
            :message="$t('Confirm restore', { name: user(id).name })"
            @confirm="waitFor(() => restore(account(id)))"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { useStore } from '@/store'
import { invite, invitationUrl, resetAllSignInSettings } from '@/auth'
import ConfirmButton from '../../components/ConfirmButton'

export default {
  name: 'AdminAccount',
  components: {
    ConfirmButton
  },
  props: {
    id: String
  },
  setup (props) {
    const store = useStore()
    const { state, waitFor } = store

    return {
      ...store,
      invitationStatus: account => {
        const invitedAt = account.invitedAt ? account.invitedAt.getTime() : 0
        const signedInAt = account.signedInAt ? account.signedInAt.getTime() : 0
        return invitedAt
          ? (signedInAt && invitedAt < signedInAt)
            ? 'Accepted'
            : (invitedAt >= (new Date().getTime() - state.service.conf.invitationExpirationTime))
              ? 'Sent'
              : 'Timeout'
          : ''
      },
      invite: () => waitFor(() => invite(store, props.id)),
      invitationUrl,
      resetAllSignInSettings: () => waitFor(() => resetAllSignInSettings(store, props.id))
    }
  }
}
</script>
