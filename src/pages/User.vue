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
          class="q-mx-sm" rounded
          icon="people" :label="group.data().name"
          :to="'/groups/' + group.id"
        />
      </span>
    </div>
    <div class="col col-12" v-if="isAdminOrManager">
      <AccountAdmin v-bind:account="$store.state.accounts.reduce((ret, cur) => cur.id === $route.params.id ? cur : ret, null)" />
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import AccountAdmin from '../components/AccountAdmin'

export default {
  name: 'PageUser',
  components: {
    AccountAdmin
  },
  computed: {
    ...mapGetters([
      'conf',
      'user',
      'isAdminOrManager'
    ])
  }
}
</script>
