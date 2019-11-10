<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col">
        <p :class="conf.styles.pageTitle">
          <q-icon name="memory" />
          Raw data
        </p>

        <q-expansion-item
          label="conf:"
          header-class="text-h6 bg-grey-3"
        >
          <pre>{{ JSON.stringify($store.state.conf, 0, 2) }}</pre>
        </q-expansion-item>

        <q-expansion-item
          label="me:"
          header-class="text-h6 bg-grey-3"
        >
          <pre>{{ JSON.stringify($store.state.me.data(), 0, 2) }}</pre>
        </q-expansion-item>

        <q-expansion-item
          label="service:"
          header-class="text-h6 bg-grey-3"
        >
          <pre>{{ JSON.stringify($store.state.service, 0, 2) }}</pre>
        </q-expansion-item>

        <q-expansion-item
          :label="'groups: [...] (' + $store.state.groups.length + ')'"
          header-class="text-h6 bg-grey-3"
        >
          <div v-for="group in $store.state.groups" v-bind:key="group.id">
            <pre>{{ group.id + ': ' + JSON.stringify(group.data(), 0, 2) }}</pre>
          </div>
        </q-expansion-item>

        <q-expansion-item
          :label="'accounts: [...] (' + $store.state.accounts.length + ')'"
          header-class="text-h6 bg-grey-3"
        >
          <div v-for="account in $store.state.accounts" v-bind:key="account.id">
            <pre>{{ account.id + ': ' + JSON.stringify(account.data(), 0, 2) }}</pre>
          </div>
        </q-expansion-item>

        <q-expansion-item
          :label="'users: [...] (' + $store.state.users.length + ')'"
          header-class="text-h6 bg-grey-3"
        >
          <div v-for="user in $store.state.users" v-bind:key="user.id">
            <pre>{{ user.id + ': ' + JSON.stringify(user.data(), 0, 2) }}</pre>
          </div>
        </q-expansion-item>

        <q-expansion-item
          :label="'profiles: {...} (' + Object.keys($store.state.profiles).length + ')'"
          header-class="text-h6 bg-grey-3"
        >
          <div v-for="id in Object.keys($store.state.profiles)" v-bind:key="id">
            <pre>{{ id + ': ' + JSON.stringify($store.state.profiles[id] ? $store.state.profiles[id].data() : null, 0, 2) }}</pre>
          </div>
        </q-expansion-item>

      </div>
    </div>
  </q-page>
</template>

<style scoped>
pre {
  font-family: 'Courier New', Courier, monospace;
}
</style>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageRawData',
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}
</script>
