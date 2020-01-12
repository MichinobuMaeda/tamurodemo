<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconRawData" />
        Raw data
      </p>

      <q-expansion-item
        label="conf:"
        header-class="text-h6 bg-grey-3"
      >
        <code><pre>{{ JSON.stringify($store.state.conf, 0, 2) }}</pre></code>
      </q-expansion-item>

      <q-expansion-item
        label="me:"
        header-class="text-h6 bg-grey-3"
      >
        <pre>{{ JSON.stringify(me, 0, 2) }}</pre>
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
          <pre>{{ JSON.stringify(group, 0, 2) }}</pre>
        </div>
      </q-expansion-item>

      <q-expansion-item
        :label="'accounts: [...] (' + $store.state.accounts.length + ')'"
        header-class="text-h6 bg-grey-3"
      >
        <div v-for="account in $store.state.accounts" v-bind:key="account.id">
          <pre>{{ JSON.stringify(account, 0, 2) }}</pre>
        </div>
      </q-expansion-item>

      <q-expansion-item
        :label="'users: [...] (' + $store.state.users.length + ')'"
        header-class="text-h6 bg-grey-3"
      >
        <div v-for="user in $store.state.users" v-bind:key="user.id">
          <pre>{{ JSON.stringify(user, 0, 2) }}</pre>
        </div>
      </q-expansion-item>

      <q-expansion-item
        :label="'profiles: {...} (' + Object.keys($store.state.profiles).length + ')'"
        header-class="text-h6 bg-grey-3"
      >
        <div v-for="id in Object.keys($store.state.profiles)" v-bind:key="id">
          <pre>{{ JSON.stringify($store.state.profiles[id], 0, 2) }}</pre>
        </div>
      </q-expansion-item>

      <q-expansion-item
        :label="'chatRooms: {...} (' + Object.keys($store.state.chatRooms).length + ')'"
        header-class="text-h6 bg-grey-3"
      >
        <q-expansion-item
          v-for="id in Object.keys($store.state.chatRooms)" v-bind:key="id"
          :label="id + ': [...] (' + ($store.state.chatRooms[id] ? $store.state.chatRooms[id].length: 0) + ')'"
          header-class="text-body1 bg-grey-4"
        >
          <div v-for="msg in $store.state.chatRooms[id]" v-bind:key="msg.id">
            <pre>{{ JSON.stringify(msg, 0, 2) }}</pre>
          </div>
        </q-expansion-item>
      </q-expansion-item>

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
      'conf',
      'me'
    ])
  }
}
</script>
