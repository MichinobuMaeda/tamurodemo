<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <div :class="conf.styles.pageTitle + (user.deletedAt ? ' bg-grey-5' : '')">
        <q-avatar :icon="user.deletedAt ? conf.styles.iconRemove : conf.styles.iconUser" />
        {{ user.name }}
        <ItemName :item="user" :collection="'users'" />
        <ItemDeleteRemove :item="user" :collection="'users'" />
      </div>

      <ItemDesc :item="user" :collection="'users'" />

      <span v-for="g in groups" v-bind:key="g.id">
        <q-btn
          class="q-ma-xs" rounded
          :icon="conf.styles.iconGroup" :label="g.name"
          :to="{ name: 'group', params: { id: g.id } }"
        />
      </span>
      <AccountAdmin v-bind:account="account($route.params.id)" v-if="isAdminOrManager" />
    </div>

  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import AccountAdmin from '../components/AccountAdmin'
import ItemName from '../components/ItemName'
import ItemDesc from '../components/ItemDesc'
import ItemDeleteRemove from '../components/ItemDeleteRemove'

export default {
  name: 'PageUser',
  components: {
    AccountAdmin,
    ItemName,
    ItemDesc,
    ItemDeleteRemove
  },
  data () {
    return {
      name: '',
      nameRule: [ v => !!v || this.$t('required') ],
      desc: ''
    }
  },
  methods: {
  },
  computed: {
    user () {
      return this.$store.getters.user(this.$route.params.id)
    },
    groups () {
      return this.$store.getters.groups.filter(
        group => group.members.includes(this.user.id) && (this.isAdminOrManager || (!this.user.deletedAt))
      )
    },
    ...mapGetters([
      'conf',
      'me',
      'account',
      'isAdminOrManager',
      'isManager'
    ])
  }
}
</script>
