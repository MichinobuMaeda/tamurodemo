<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconPrivacyPolicy" />
        {{ $t('privacyPolicy') }}
      </p>
      <VueMarkdown>{{ $store.state.service.conf.privacyPolicy }}</VueMarkdown>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'PagePrivacyPolicy',
  components: {
    VueMarkdown
  },
  computed: {
    ...mapGetters([ 'conf' ])
  }
}
</script>
