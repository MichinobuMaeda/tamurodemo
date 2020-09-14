<template>
  <v-row justify="center">
    <v-col sm="10" md="8" lg="6" xl="5">
      <PageTitle :title="$t('Sign in')" icon="account_circle" />
    </v-col>
  </v-row>
</template>

<script>
import store from '../plugins/composition-api'
import PageTitle from '../components/PageTitle'

export default {
  name: 'SignInPolicy',
  components: {
    PageTitle
  },
  setup () {
    return store.useStore()
  }
}
</script>
