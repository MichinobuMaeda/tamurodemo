<template>
  <q-page class="row">
    <div class="col text-center q-py-xl">
      <q-spinner-ball :color="conf.styles.menuBg" size="6em" />
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageLoading',
  data () {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}
</script>
