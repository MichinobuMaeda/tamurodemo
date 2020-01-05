<template>
  <q-dialog ref="dialog">
    <q-card :style="conf.styles.dlgCardStyle">
      <q-card-section :class="conf.styles.dlgTitle + color">
        <q-avatar :icon="icon" />
        {{ title }}
        <q-space />
        <q-btn icon="fas fa-times" flat round dense v-close-popup />
      </q-card-section>
      <q-separator />
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
