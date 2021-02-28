<template>
  <v-row>
    <v-col class="col-12">
      <v-row v-for="provider in providers.filter(provider => ['oauth'].includes(provider.type))" :key="provider.id">
        <v-col class="title--text col-4 text-right">{{ provider.name }}</v-col>
        <v-col class="col-8">
          <OnOffEditor
            type="select"
            :label="provider.name"
            v-model="state.service.auth[provider.id.replace(/\./g, '_')]"
            :labelTrue="$t('Enabled')"
            iconTrue="cloud_done"
            :labelFalse="$t('Disabled')"
            iconFalse="cloud_off"
            @save="val => waitFor(() => update(state.service.auth, { [provider.id.replace(/\./g, '_')]: val }))"
            :editable="me.priv.admin"
            :disabled="!!state.waitProc"
          />
        </v-col>
      </v-row>
      <v-row v-for="provider in providers.filter(provider => ['custom'].includes(provider.type))" :key="provider.id">
        <v-col class="title--text col-4 text-right">{{ provider.name }}</v-col>
        <v-col class="col-8">
          <v-row>
            <v-col class="col-12">
              <OnOffEditor
                type="select"
                :label="provider.name"
                v-model="state.service.auth[provider.id.replace(/\./g, '_')]"
                :labelTrue="$t('Enabled')"
                iconTrue="cloud_done"
                :labelFalse="$t('Disabled')"
                iconFalse="cloud_off"
                @save="val => waitFor(() => update(state.service.auth, { [provider.id.replace(/\./g, '_')]: val }))"
                :editable="me.priv.admin"
                :disabled="!!state.waitProc"
              />
            </v-col>
          </v-row>
          <div v-if="me.priv.admin">
            <v-row v-for="item in state.service.auth[provider.id.replace(/\./g, '_')] ? provider.params : []" :key="item">
              <v-col class="col-12">
                <TextEditor
                  type="select"
                  :label="item"
                  :placeholder="item"
                  v-model="state.service.auth[`${provider.id.replace(/\./g, '_')}_${item}`]"
                  @save="val => waitFor(() => update(state.service.auth, { [`${provider.id.replace(/\./g, '_')}_${item}`]: val }))"
                  :editable="me.priv.admin"
                  :disabled="!!state.waitProc"
                />
              </v-col>
            </v-row>
            <v-row v-for="item in state.service.auth[provider.id.replace(/\./g, '_')] ? provider.secrets : []" :key="item">
              <v-col class="col-12" v-if="state.secrets.auth">
                <TextEditor
                  type="select"
                  :label="item"
                  :placeholder="item"
                  v-model="state.secrets.auth[`${provider.id.replace(/\./g, '_')}_${item}`]"
                  @save="val => waitFor(() => update(state.secrets.auth, { [`${provider.id.replace(/\./g, '_')}_${item}`]: val }))"
                  :editable="me.priv.admin"
                  :disabled="!!state.waitProc"
                />
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../../store'
import { authProviders } from '../../auth'
import OnOffEditor from '../../components/OnOffEditor'
import TextEditor from '../../components/TextEditor'

export default {
  name: 'AdminAuthentication',
  components: {
    OnOffEditor,
    TextEditor
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
