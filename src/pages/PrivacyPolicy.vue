<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col q-gutter-sm">
        <p :class="conf.styles.pageTitle">
          <q-icon name="policy" />
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
