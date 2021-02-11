<template>
  <v-row>
    <v-col class="col-12">
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Invitation') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="select"
            :label="$t('Invitation')"
            :items="[{ text: $t('Enabled'), value: true }, { text: $t('Disabled'), value: false }]"
            v-model="invitation"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Invitation expiration') }}</v-col>
        <v-col class="col-4">
          <EditableItem
            :label="$t('Invitation expiration')"
            v-model="invitationExpirationTime"
            :rules="[ruleNotNegative]"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
        <v-col class="col-4">
          {{ msecToDaysAndTime(invitationExpirationTime) }}
        </v-col>
      </v-row>
      <v-row>
         <v-col class="title--text col-12">{{ $t('GuidanceText') }}</v-col>
         <v-col class="col-12">
          <EditableItem
            type="formatted-text"
            :label="$t('Description')"
            v-model="guide"
            :editable="priv.manager || priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <LinkButton
        :icon="icon('Preview')"
        :label="$t('Preview')"
        @click="goPage({ name: 'prevwInvitation' })"
      />
   </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../../store'
import EditableItem from '../../components/EditableItem'
import LinkButton from '../../components/LinkButton'

export default {
  name: 'SectionInvitation',
  components: {
    EditableItem,
    LinkButton
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
