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
            v-model="state.service.auth.invitation"
            @save="val => waitFor(() => update(state.service.auth, { invitation: val }))"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row v-if="state.service.auth.invitation">
        <v-col class="title--text col-4 text-right">{{ $t('Invitation expiration') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Invitation expiration')"
            v-model="invitationExpirationTime"
            :rules="rulesDaysAndTime"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="col-12">
          <EditableItem
            type="formatted-text"
            :label="$t('Description')"
            v-model="state.service.conf.guide"
            @save="val => waitFor(() => update(state.service.conf, { guide: val }))"
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
  setup (prop, { root }) {
    const store = useStore()
    const { waitFor, update } = store

    const dateToDaysAndTime = val => {
      const d = Math.floor(val / (24 * 60 * 60 * 1000))
      return `${d} ${new Date(val % (24 * 60 * 60 * 1000)).toISOString().slice(11, 19)}`
    }

    const daysAndTimeToDate = val => {
      const str = (val || '').trim()
      const dt = (/ /.test(str) ? str.replace(/ .*/, '') : (/:/.test(str) ? '' : str)) || '0'
      const tm = (/ /.test(str) ? str.replace(/.* /, '') : (/:/.test(str) ? str : '')) || '0:00'
      return Number(dt) * 24 * 60 * 60 * 1000 +
        new Date('1970-01-01 ' + tm).getTime() - new Date('1970-01-01T00:00:00').getTime()
    }

    return {
      ...store,
      invitationExpirationTime: computed({
        get: () => dateToDaysAndTime(store.state.service.conf.invitationExpirationTime),
        set: str => waitFor(() => update(store.state.service.conf, { invitationExpirationTime: daysAndTimeToDate(str) }))
      }),
      rulesDaysAndTime: [
        v => daysAndTimeToDate(v) > 0 || '"d" or "h:mm:ss" or  "d h:mm:ss"'
      ]
    }
  }
}
</script>
