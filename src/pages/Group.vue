<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <div :class="conf.styles.pageTitle + (group.deletedAt ? ' bg-grey-5' : '')">
        <q-avatar :icon="group.deletedAt ? conf.styles.iconRemove : conf.styles.iconGroup" />
        {{ group.name }}
        <ItemName :item="group" :collection="'groups'" />
        <ItemDeleteRemove :item="group" :collection="'groups'" />
      </div>

      <ItemDesc :item="group" :collection="'groups'" />

      <q-list>
        <q-item
          v-if="isManager"
          clickable v-ripple @click="createMember"
          class="text-primary"
        >
          <q-item-section avatar><q-icon :name="conf.styles.iconAddUser" /></q-item-section>
          <q-item-section>{{ $t('createMember') }}</q-item-section>
        </q-item>
        <Dialog ref="createMember" :color="'primary'" :icon="conf.styles.iconAdd" :title="$t('createMember')">
          <q-card-section>
            <q-input type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveMember" :disable="!name"
            />
          </q-card-section>
        </Dialog>

        <div v-for="u in users" v-bind:key="u.id">
          <q-item clickable v-ripple :to="{ name: 'user', params: { id: u.id } }">
            <q-item-section avatar>
              <q-icon :name="conf.styles.iconRemove" v-if="u.deletedAt" />
              <q-icon :name="conf.styles.iconUser" v-else />
            </q-item-section>
            <q-item-section>{{ u.name }}</q-item-section>
            <q-item-section avatar>
              <q-avatar v-if="isAdminOrManager">
                <q-icon :name="conf.styles.accountStatus[accountStatus(u.id)]" />
              </q-avatar>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </div>

  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import Dialog from '../components/Dialog'
import ItemName from '../components/ItemName'
import ItemDesc from '../components/ItemDesc'
import ItemDeleteRemove from '../components/ItemDeleteRemove'

export default {
  name: 'PageGroup',
  components: {
    Dialog,
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
    createMember () {
      this.name = ''
      this.$refs.createMember.$refs.dialog.show()
    },
    async saveMember () {
      this.$refs.createMember.$refs.dialog.hide()
      await this.$store.state.functions.httpsCallable('createMember')({
        id: this.$route.params.id,
        name: this.name
      })
    }
  },
  computed: {
    group () {
      return this.$store.getters.group(this.$route.params.id)
    },
    users () {
      return this.$store.getters.users.filter(
        user => this.group.members.includes(user.id) && (this.isAdminOrManager || (!user.deletedAt))
      )
    },
    ...mapGetters([
      'conf',
      'accountStatus',
      'isAdminOrManager',
      'isManager'
    ])
  }
}
</script>
