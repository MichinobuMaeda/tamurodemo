<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="people" />
        {{ group($route.params.id).data().name }}
      </p>
      <q-list>
        <div v-for="user in $store.state.users" v-bind:key="user.id">
          <q-item
            v-if="group($route.params.id).data().members.includes(user.id)"
            clickable v-ripple :to="'/users/' + user.id"
          >
            <q-item-section avatar><q-icon name="person" /></q-item-section>
            <q-item-section>{{ user.data().name }}</q-item-section>
          </q-item>
        </div>
      </q-list>
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
