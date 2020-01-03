<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm">
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
