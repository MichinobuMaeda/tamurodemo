<template>
  <v-row>
    <v-col class="col-12">
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Invitation') }}</v-col>
        <v-col class="col-8">
          <OnOffEditor
            type="select"
            :label="$t('Invitation')"
            v-model="invitation"
            :labelTrue="$t('Enabled')"
            iconTrue="cloud_done"
            :labelFalse="$t('Disabled')"
            iconFalse="cloud_off"
            :editable="me.priv.admin || me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Invitation expiration') }}</v-col>
        <v-col class="col-4">
          <TextEditor
            :label="$t('Invitation expiration')"
            type="number"
            v-model="invitationExpirationTime"
            :rules="[ruleNotNegative]"
            :editable="me.priv.admin || me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
        <v-col class="col-4">
          {{ msecToDaysAndTime(invitationExpirationTime || 0) }}
        </v-col>
      </v-row>
   </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../../store'
import OnOffEditor from '../../components/OnOffEditor'
import TextEditor from '../../components/TextEditor'

export default {
  name: 'AdminInvitation',
  components: {
    OnOffEditor,
    TextEditor
  },
  setup () {
    const store = useStore()
    const { state, waitFor, update } = store

    return {
      ...store,
      invitation: computed({
        get: () => state.service.auth.invitation,
        set: str => waitFor(() => update(state.service.auth, { invitation: str }))
      }),
      invitationExpirationTime: computed({
        get: () => state.service.conf.invitationExpirationTime,
        set: str => waitFor(() => update(state.service.conf, { invitationExpirationTime: str }))
      }),
      guide: computed({
        get: () => state.service.conf.guide,
        set: str => waitFor(() => update(state.service.conf, { guide: str }))
      })
    }
  }
}
</script>
