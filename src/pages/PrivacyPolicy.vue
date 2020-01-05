<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconPrivacyPolicy" />
        {{ $t('privacyPolicy') }}
      </p>
      <p>
        This site is the test site for <a href="https://github.com/MichinobuMaeda/tamuro">Tamuro</a> project.
        Please don't post your personal information.
      </p>
      <p>
        このサイトは <a href="https://github.com/MichinobuMaeda/tamuro">Tamuro</a> プロジェクトのテストサイトです。
        個人情報を入力しないでください。
      </p>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PagePrivacyPolicy',
  computed: {
    ...mapGetters([ 'conf' ])
  }
}
</script>
