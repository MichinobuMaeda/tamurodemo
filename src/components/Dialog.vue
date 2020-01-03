<template>
  <q-dialog ref="dialog">
    <q-card :style="conf.styles.dlgCardStyle">
      <q-card-section :class="conf.styles.dlgTitle">
        <q-avatar :icon="icon" :text-color="conf.styles.dlgTitleIconColor" />
        <span :class="conf.styles.dlgTitleText">{{ title }}</span>
        <q-space />
        <q-btn icon="fas fa-times" flat round dense v-close-popup />
      </q-card-section>
      <slot />
    </q-card>
  </q-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dialog',
  props: [ 'icon', 'title' ],
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}
</script>
