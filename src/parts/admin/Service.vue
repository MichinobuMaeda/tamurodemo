<template>
  <v-row>
    <v-col class="col-12">
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Site name') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Site name')"
            v-model="name"
            :rules="[ruleRequired]"
            :editable="me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">URL</v-col>
        <v-col class="col-8">
          <EditableItem
            label="URL"
            v-model="hosting"
            :rules="[ruleRequired, ruleUrl]"
            :editable="me.priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Notification expiration') }}</v-col>
        <v-col class="col-4">
          <EditableItem
            type="number"
            :label="$t('Notification expiration')"
            v-model="notificationExpirationTime"
            :rules="[ruleNotNegative]"
            :editable="me.priv.admin || me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
        <v-col class="col-4">
          {{ msecToDaysAndTime(notificationExpirationTime) }}
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Notification pause repetition') }}</v-col>
        <v-col class="col-4">
          <EditableItem
            type="number"
            :label="$t('Notification pause repetition')"
            v-model="notificationPauseRepetitionTime"
            :rules="[ruleNotNegative]"
            :editable="me.priv.admin || me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
        <v-col class="col-4">
          {{ msecToDaysAndTime(notificationPauseRepetitionTime) }}
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Notification icon') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Notification icon')"
            v-model="notificationIconPath"
            :rules="[ruleRequired]"
            :editable="me.priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Max count of addresses') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            type="number"
            :label="$t('Max count of addresses')"
            v-model="profileAddressCount"
            :rules="[rulePositive]"
            :editable="me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">API key</v-col>
        <v-col class="col-8">
          <EditableItem
            label="API key"
            v-model="apiKey"
            :rules="[ruleRequired]"
            :editable="me.priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../../store'
import EditableItem from '../../components/EditableItem'

export default {
  name: 'AdminService',
  components: {
    EditableItem
  },
  setup () {
    const store = useStore()
    const { state, waitFor, update } = store

    return {
      ...store,
      name: computed({
        get: () => state.service.conf.name,
        set: str => waitFor(() => update(state.service.conf, { name: str }))
      }),
      hosting: computed({
        get: () => state.service.conf.hosting,
        set: str => waitFor(() => update(state.service.conf, { hosting: str }))
      }),
      notificationExpirationTime: computed({
        get: () => state.service.conf.notificationExpirationTime,
        set: str => waitFor(() => update(state.service.conf, { notificationExpirationTime: Number(str) }))
      }),
      notificationPauseRepetitionTime: computed({
        get: () => state.service.conf.notificationPauseRepetitionTime,
        set: str => waitFor(() => update(state.service.conf, { notificationPauseRepetitionTime: Number(str) }))
      }),
      notificationIconPath: computed({
        get: () => state.service.conf.notificationIconPath,
        set: str => waitFor(() => update(state.service.conf, { notificationIconPath: str }))
      }),
      profileAddressCount: computed({
        get: () => state.service.conf.profileAddressCount,
        set: str => waitFor(() => update(state.service.conf, { profileAddressCount: Number(str) }))
      }),
      apiKey: computed({
        get: () => state.service.conf.apiKey,
        set: str => waitFor(() => update(state.service.conf, { apiKey: str }))
      })
    }
  }
}
</script>
