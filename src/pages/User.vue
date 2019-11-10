<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="person" />
        {{ user($route.params.id).data().name }}
      </p>
      <span v-for="group in $store.state.groups" v-bind:key="group.id">
        <q-btn
          v-if="group.data().members.includes($route.params.id)"
          class="q-mx-sm" rounded outline
          icon="people" :label="group.data().name"
          :to="'/groups/' + group.id"
        />
      </span>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageUser',
  computed: {
    ...mapGetters([
      'conf',
      'user'
    ])
  }
}
</script>
