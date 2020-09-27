<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle
        :text-color="color.pageTitle"
        :icon-color="color.pageIcon"
        :title="$t('Profile and Settings', { user: myName })"
        :icon="icon('Profile and Settings')"
      />
      <div v-if="!page.confirmSginOut">
        <ButtonNegative
          :label="$t('Sign out')"
          :icon="icon('Sign out')"
          @click="() => { page.confirmSginOut = true }"
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
              @click="() => { page.confirmSginOut = false }"
            />
          </v-col>
          <v-col class="text-right">
            <ButtonNegative
              :label="$t('Sign out')"
              :icon="icon('Sign out')"
              @click="signOut"
            />
          </v-col>
        </v-row>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from "@vue/composition-api";
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import ButtonSecondary from '@/components/ButtonSecondary'
import ButtonNegative from '@/components/ButtonNegative'

export default {
  name: 'PageMyProfile',
  components: {
    PageTitle,
    ButtonSecondary,
    ButtonNegative
  },
  setup () {
    const { useStore, signInUrl, setProcForWait } = helpers
    const store = useStore()
    const page = reactive({
      confirmSginOut: false,
      waitProc: false
    })

    const signOut = async (auth, page) => {
      await auth.signOut()
      page.confirmSginOut = false
      window.location.href = signInUrl()
    }

    return {
      ...store,
      page,
      signOut: () => setProcForWait(page, () => signOut(store.auth, page)),
      ...helpers
    }
  }
}
</script>
