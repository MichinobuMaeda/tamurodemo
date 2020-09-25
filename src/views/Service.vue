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
              @click="waitUpdateForProc(state, updateServiceVersion)"
            />
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import ButtonPrimary from '../components/ButtonPrimary'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    ButtonPrimary
  },
  setup () {
    return useStore()
  }
}
</script>
