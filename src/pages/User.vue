<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-avatar icon="fas fa-user" />
        {{ user($route.params.id).name }}
      </p>
      <span v-for="g in groups" v-bind:key="g.id">
        <q-btn
          v-if="g.members.includes($route.params.id)"
          class="q-ma-xs" rounded
          icon="fas fa-users" :label="g.name"
          :to="{ name: 'group', params: { id: g.id } }"
        />
      </span>
    </div>
    <div class="col col-12" v-if="isAdminOrManager">
      <AccountAdmin v-bind:account="account($route.params.id)" />
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
      'groups',
      'account',
      'isAdminOrManager'
    ])
  }
}
</script>
