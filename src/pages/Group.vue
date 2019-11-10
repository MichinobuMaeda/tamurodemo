<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="people" />
        {{ group($route.params.id).data().name }}
      </p>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageGroup',
  computed: {
    ...mapGetters([
      'conf',
      'group'
    ])
  }
}
</script>
