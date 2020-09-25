<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="state.color.pageTitle"
        :icon-color="state.color.pageIcon"
        :title="$t('Profile and Settings', { user: myName(state) })"
        :icon="icon('Profile and Settings')"
      />
      <div v-if="!state.confirmSginOut">
        <ButtonNegative
          :label="$t('Sign out')"
          :icon="icon('Sign out')"
          @click="() => { state.confirmSginOut = true }"
        />
      </div>
      <div v-else>
        <v-alert type="error" dense outlined>
          {{ $t('Confirm sign out') }}
        </v-alert>
        <v-row>
          <v-col>
            <ButtonSecondary
              :label="$t('Cancel')"
              :icon="icon('Cancel')"
              @click="() => { state.confirmSginOut = false }"
            />
          </v-col>
          <v-col class="text-right">
            <ButtonNegative
              :label="$t('Sign out')"
              :icon="icon('Sign out')"
              @click="waitUpdateForProc(state, () => signOut(state))"
            />
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { useStore } from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'
import ButtonSecondary from '../components/ButtonSecondary'
import ButtonNegative from '../components/ButtonNegative'

export default {
  name: 'PageMyProfile',
  components: {
    PageTitle,
    ButtonSecondary,
    ButtonNegative
  },
  setup () {
    return useStore()
  }
}
</script>
