<template>
  <q-dialog ref="dialog">
    <q-card :style="conf.styles.dlgCardStyle">
      <q-card-section :class="conf.styles.dlgTitle + color">
        <q-avatar :icon="icon" />
        {{ title }}
        <q-space />
        <q-btn :icon="conf.styles.iconClose" flat round dense v-close-popup />
      </q-card-section>
      <slot />
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dialog',
  props: [ 'color', 'icon', 'title' ],
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}
</script>
