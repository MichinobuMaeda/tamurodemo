<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Service settings')"
        :icon="icon('Service settings')"
      />
      <v-list>

        <v-list-item>
          <v-list-item-content>
            Ver. {{ state.service.conf.version }}
          </v-list-item-content>
          <v-list-item-action>
            <ButtonPrimary
              :icon="icon('Update service')"
              @click="waitProc(state, updateServiceVersion)"
            />
          </v-list-item-action>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-text-field label="Site name" v-model="temp.name" />
          </v-list-item-content>
          <v-list-item-action>
            <ButtonPrimary
              :icon="icon('Save')"
              :disabled="temp.name === state.service.conf.name"
              @click="waitProc(state, () => updateServiceConf('name', temp.name))"
            />
          </v-list-item-action>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-text-field label="URL" v-model="temp.hosting" />
          </v-list-item-content>
          <v-list-item-action>
            <ButtonPrimary
              :icon="icon('Save')"
              :disabled="temp.hosting === state.service.conf.hosting"
              @click="waitProc(state, () => updateServiceConf('hosting', temp.hosting))"
            />
          </v-list-item-action>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-select
              label="Default menu position"
              v-model="temp.menuPosition"
              :items="[
                {
                  text: $t('Top Left'),
                  value: 'tl'
                },
                {
                  text: $t('Top Right'),
                  value: 'tr'
                },
                {
                  text: $t('Bottom Left'),
                  value: 'bl'
                },
                {
                  text: $t('Bottom Right'),
                  value: 'br'
                }
              ]"
            />
          </v-list-item-content>
          <v-list-item-action>
            <ButtonPrimary
              :icon="icon('Save')"
              :disabled="temp.menuPosition === state.service.defaults.menuPosition"
              @click="waitProc(state, () => updateServiceDefaults('menuPosition', temp.menuPosition))"
            />
          </v-list-item-action>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-select
              label="Default locale"
              v-model="temp.locale"
              :items="locales"
            />
          </v-list-item-content>
          <v-list-item-action>
            <ButtonPrimary
              :icon="icon('Save')"
              :disabled="temp.locale === state.service.defaults.locale"
              @click="waitProc(state, () => updateServiceDefaults('locale', temp.locale))"
            />
          </v-list-item-action>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-select
              label="Default timezone"
              v-model="temp.tz"
              :items="timezones"
            />
          </v-list-item-content>
          <v-list-item-action>
            <ButtonPrimary
              :icon="icon('Save')"
              :disabled="temp.tz === state.service.defaults.tz"
              @click="waitProc(state, () => updateServiceDefaults('tz', temp.tz))"
            />
          </v-list-item-action>
        </v-list-item>

      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import ButtonPrimary from '../components/ButtonPrimary'
import timezones from '../conf/timezones'
import locales from '../conf/locales'

export default {
  name: 'PageService',
  components: {
    PageTitle,
    ButtonPrimary
  },
  setup() {
    const store = useStore()
    const temp = reactive({
      name: store.state.service.conf.name,
      hosting: store.state.service.conf.hosting,
      locale: store.state.service.defaults.locale,
      menuPosition: store.state.service.defaults.menuPosition,
      tz: store.state.service.defaults.tz
    })

    return {
      temp,
      ...store,
      timezones,
      locales
    }
  }
}
</script>
