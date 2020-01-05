<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconService" />
        Service
      </p>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PageService',
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([
    ])
  },
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}

</script>
