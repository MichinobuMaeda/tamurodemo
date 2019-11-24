<template>
  <q-page class="row">
    <div class="col text-center q-py-xl" style="font-size: 4em">
      <q-spinner-ball :color="conf.styles.menuBg" size="3em" />
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageLoading',
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}
</script>
