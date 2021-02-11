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
            :editable="priv.manager"
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
            :editable="priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Notification expiration') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Notification expiration')"
            v-model="notificationExpirationTime"
            :rules="rulesDaysAndTime"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Notification pause repetition') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Notification pause repetition')"
            v-model="notificationPauseRepetitionTime"
            :rules="rulesDaysAndTime"
            :editable="priv.admin || priv.manager"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="title--text col-4 text-right">{{ $t('Notification icon') }}</v-col>
        <v-col class="col-8">
          <EditableItem
            :label="$t('Notification icon')"
            v-model="notificationIconPath"
            :rules="[ruleRequired]"
            :editable="priv.admin"
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
            :editable="priv.admin"
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
  name: 'SectionService',
  components: {
    EditableItem
  },
  setup () {
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
      name: computed({
        get: () => store.state.service.conf.name,
        set: str => waitFor(() => update(store.state.service.conf, { name: str }))
      }),
      hosting: computed({
        get: () => store.state.service.conf.hosting,
        set: str => waitFor(() => update(store.state.service.conf, { hosting: str }))
      }),
      notificationExpirationTime: computed({
        get: () => dateToDaysAndTime(store.state.service.conf.notificationExpirationTime),
        set: str => waitFor(() => update(store.state.service.conf, { notificationExpirationTime: daysAndTimeToDate(str) }))
      }),
      notificationPauseRepetitionTime: computed({
        get: () => dateToDaysAndTime(store.state.service.conf.notificationPauseRepetitionTime),
        set: str => waitFor(() => update(store.state.service.conf, { notificationPauseRepetitionTime: daysAndTimeToDate(str) }))
      }),
      notificationIconPath: computed({
        get: () => store.state.service.conf.notificationIconPath,
        set: str => waitFor(() => update(store.state.service.conf, { notificationIconPath: str }))
      }),
      apiKey: computed({
        get: () => store.state.service.conf.apiKey,
        set: str => waitFor(() => update(store.state.service.conf, { apiKey: str }))
      }),
      rulesDaysAndTime: [
        v => daysAndTimeToDate(v) > 0 || '"d" or "h:mm:ss" or  "d h:mm:ss"'
      ]
    }
  }
}
</script>
