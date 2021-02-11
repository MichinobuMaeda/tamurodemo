<template>
  <v-row>
    <v-col class="col-12">
      <v-row v-for="provider in providers.filter(provider => ['oauth', 'custom'].includes(provider.type))" :key="provider.id">
        <v-col class="title--text col-4 text-right">{{ provider.name }}</v-col>
        <v-col class="col-8">
          <EditableItem
            v-if="provider.type === 'oauth'"
            type="select"
            :label="provider.name"
            v-model="state.service.auth[provider.id.replace(/\./g, '_')]"
            :items="[{ text: $t('Enabled'), value: true }, { text: $t('Disabled'), value: false }]"
            @save="val => waitFor(() => update(state.service.auth, { [provider.id.replace(/\./g, '_')]: val }))"
            :editable="priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../../store'
import { authProviders } from '../../auth'
import EditableItem from '../../components/EditableItem'

export default {
  name: 'SectionAuthentication',
  components: {
    EditableItem
  },
  setup () {
    const store = useStore()

    return {
      ...store,
      providers: authProviders(store)
    }
  }
}
</script>
