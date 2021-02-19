<template>
  <v-row>
    <v-col class="col-12">

      <CreateUser class="text-right" />

      <div class="mb-4">
        <v-icon
          v-for="status in accountStatus" :key="status"
          :class="'mx-1' + (me.filterAccountStatus === status ? ' info--text' : ' primary--text')"
          @click="() => update(me, { filterAccountStatus: me.filterAccountStatus === status ? null : status } )"
          :style="{
            textDecoration: me.filterAccountStatus === status ? 'underline' : ''
          }"
        >
          {{ conf.icon(status) }}
        </v-icon>
        {{ $t(me.filterAccountStatus) }}
      </div>

      <v-data-table
        dense
        hide-default-header
        :items="items"
        :items-per-page="10"
        :footer-props="{
          itemsPerPageOptions: [10, 25, 50, 100, -1],
          itemsPerPageText: `${$t('Rows per page')}:`,
          itemsPerPageAllText: $t('All'),
          pageText: '',
          showCurrentPage: true,
          showFirstLastPage: true
        }"
      >
        <template v-slot:header>
          <tr>
            <td
              class="text-center sticky"
              :style="{
                height: '3em',
                minWidth: '192px',
                backgroundColor: $vuetify.theme.dark ? '#303030' : '#f0f0f0'
              }"
            >
              {{ $t('User') }}
            </td>
            <td
              v-for="(group, index) in sortedGroups(state)" :key="group.id"
              :class="'text-center' + (me.filterGroup === group.id ? ' info--text' : ' primary--text')"
              :style="{
                minWidth: '128px',
                backgroundColor: $vuetify.theme.dark ? (index % 2 ? '#303030' : '#404040') : (index % 2 ? '#f0f0f0' : '#e0e0e0'),
              }"
              @click="() => update(me, { filterGroup: me.filterGroup === group.id ? null : group.id } )"
            >
              <span
                :style="{
                  borderBottom: me.filterGroup === group.id ? 'solid 1px #009688' : ''
                }"
              >
                {{ group.name }}
              </span>
            </td>
          </tr>
        </template>
        <template v-slot:body="{ items }">
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td
                class="sticky primary--text"
                :style="{
                  minWidth: '192px',
                  backgroundColor: $vuetify.theme.dark ? '#202020' : '#ffffff'
                }"
                @click="() => goPageUser(item.id, true)"
              >
                <v-icon class="primary--text">
                  {{ conf.icon(account(item.id).status) }}
                </v-icon>
                {{ item.name }}
              </td>
              <td
                v-for="(group, index) in sortedGroups(state)" :key="group.id"
                class="text-center"
                :style="{
                  minWidth: '128px',
                  backgroundColor: $vuetify.theme.dark ? (index % 2 ? '#202020' : '#303030') : (index % 2 ? '#ffffff' : '#f0f0f0')
                }"
              >
                {{ item.groups.map(group => group.id).includes(group.id) ? 'o' : '' }}
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<style scoped>
.sticky {
  position: sticky !important;
  position: -webkit-sticky !important;
  left: 0;
  z-index: 9998;
}
</style>

<script>
import { computed } from '@vue/composition-api'
import { useStore, sortedGroups } from '../../store'
import CreateUser from './CreateUser'

export default {
  name: 'AdminUsers',
  components: {
    CreateUser
  },
  setup () {
    const store = useStore()
    const { state, account } = store

    return {
      ...store,
      sortedGroups,
      accountStatus: [
        'Account inactive',
        'Invited',
        'Invitation timeout',
        'Invitation accepted',
        'Account active',
        'Account locked',
        'Account deleted'
      ],
      items: computed(() => state.users.map(user => ({ ...account(user.id), ...user }))
        .filter(user => !state.me.filterAccountStatus || user.status === state.me.filterAccountStatus)
        .filter(user => user.groups.some(group => !state.me.filterGroup || group.id === state.me.filterGroup)))
    }
  }
}
</script>
