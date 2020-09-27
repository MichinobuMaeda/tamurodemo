<template>
  <v-row justify="center">
    <v-col sm="10" md="8">
      <PageTitle
        :text-color="color.pageTitle"
        :icon-color="color.pageIcon"
        :title="$t('Service settings')"
        :icon="icon('Service settings')"
      />
      <v-row>
        <v-col :class="color.pageTitle + ' col-4'">Version</v-col>
        <v-col class="col-6">{{ state.service.conf.version }}</v-col>
        <v-col class="col-2 text-right">
          <MiniButton
            v-if="priv.admin"
            :icon="icon('Update service')"
            @click="updateServiceVersion"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="color.pageTitle + ' col-4'">URL</v-col>
        <v-col class="col-8">
          <EditableText
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.admin"
            v-model="state.service.conf.hosting"
            :rules="[
              v => !!v || $t('Required'),
              v => validateURL(v) || $t('Invalid URL format')
            ]"
            @save="val => updateStoreService('conf', { hosting: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="color.pageTitle + ' col-4'">{{ $t('Site name') }}</v-col>
        <v-col class="col-8">
          <EditableText
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            v-model="state.service.conf.name"
            :rules="[v => !!v || $t('Required')]"
            @save="val => updateStoreService('conf', { name: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <p :class="color.pageTitle + ' text-h6 pt-6'">
        <v-icon :color="color.pageIcon">{{ icon('Defaults') }}</v-icon>
        {{ $t('Defaults') }}
      </p>
      <v-row>
        <v-col :class="color.pageTitle + ' col-4'">{{ $t('Menu position') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            v-model="state.service.defaults.menuPosition"
            :items="menuPositions.map(item => ({ ...item, text: $t(item.text) }))"
            @save="val => updateStoreService('defaults', { menuPosition: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="color.pageTitle + ' col-4'">{{ $t('Locale') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            v-model="state.service.defaults.locale"
            :items="locales"
            @save="val => updateStoreService('defaults', { locale: val })"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col :class="color.pageTitle + ' col-4'">{{ $t('Timezone') }}</v-col>
        <v-col class="col-8">
          <EditableSelect
            :icon-edit="icon('Edit')"
            :icon-cancel="icon('Cancel')"
            :icon-save="icon('Save')"
            :editable="priv.manager"
            v-model="state.service.defaults.tz"
            :items="timezones"
            @save="val => updateStoreService('defaults', { tz: val })"
          />
        </v-col>
      </v-row>
      <v-divider />

    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import MiniButton from '@/components/MiniButton'
import EditableText from '@/components/EditableText'
import EditableSelect from '@/components/EditableSelect'

export default {
  name: 'PageService',
  components: {
    PageTitle,
    MiniButton,
    EditableText,
    EditableSelect
  },
  setup() {
    const { useStore, setProcForWait } = helpers
    const store = useStore()
    const { updateStore, functions } = store

    const page = reactive({
      name: store.state.service.conf.name,
      hosting: store.state.service.conf.hosting,
      locale: store.state.service.defaults.locale,
      menuPosition: store.state.service.defaults.menuPosition,
      tz: store.state.service.defaults.tz,
      waitProc: false
    })

    return {
      ...store,
      page,
      updateServiceVersion: () => setProcForWait(
        page,
        () => functions.httpsCallable("updateServiceVersion").call()
      ),
      updateStoreService: (id, data) => setProcForWait(
        page,
        () => updateStore('service', id, data)
      ),
      ...helpers
    }
  }
}
</script>
