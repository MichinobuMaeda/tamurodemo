<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col q-gutter-sm">
        <p :class="conf.styles.pageTitle">
          <q-icon name="settings_applications" />
          {{ $t('preferences') }}
        </p>
        <p>
          <q-btn outline color="negative" :label="$t('signout')" @click="signOut" />
        </p>
      </div>
    </div>
  </div>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PagePreferences',
  methods: {
    ...mapActions([ 'signOut' ])
  },
  computed: {
    ...mapGetters([ 'conf' ])
  }
}
</script>
