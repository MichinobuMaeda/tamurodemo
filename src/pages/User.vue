<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm">
      <div :class="conf.styles.pageTitle + (user.deletedAt ? ' bg-grey-5' : '')">
        <q-avatar :icon="user.deletedAt ? conf.styles.iconRemove : conf.styles.iconUser" />
        {{ user.name }}

        <q-btn
          v-if="isManager || user.id === me.id"
          flat raund :icon="conf.styles.iconEdit"
          @click="editName"
        />
        <Dialog ref="name" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-input type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveName" :disable="!name || name === user.name"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          v-if="isManager && !user.deletedAt"
          flat raund :icon="conf.styles.iconRemove"
          @click="deleteThisUser"
        />
        <Dialog ref="delete" :color="'negative'" :icon="conf.styles.iconRemove" :title="$t('delete')">
          <q-card-section>
            <div>{{ $t('confirmUserDeletion') }}</div>
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="negative" no-caps :label="$t('ok')" @click="saveDeletion"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          v-if="isManager && user.deletedAt"
          flat raund :icon="conf.styles.iconRestore"
          @click="restoreThisUser"
        />
        <Dialog ref="restore" :color="'negative'" :icon="conf.styles.iconRestore" :title="$t('restore')">
          <q-card-section>
            <div>{{ $t('confirmUserRestore') }}</div>
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="negative" no-caps :label="$t('ok')" @click="saveRestoration"
            />
          </q-card-section>
        </Dialog>

      </div>

      <q-banner class="bg-grey-3" v-if="user && user.desc || isManager">
        <q-btn class="float-right" flat raund :icon="conf.styles.iconEdit" @click="editDesc" />
        <Dialog ref="desc" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-input type="textarea" v-model="desc" :label="$t('desc')" />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveDesc" :disable="desc === user.desc"
            />
          </q-card-section>
        </Dialog>
        <div v-if="user.desc">
          <p v-for="(line, index) in user.desc.split('\n')" :key="index">{{ line }}</p>
        </div>
        <div v-else>{{ $t('noDesc') }}</div>
      </q-banner>

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
import Dialog from '../components/Dialog'

export default {
  name: 'PageUser',
  components: {
    AccountAdmin,
    Dialog
  },
  data () {
    return {
      name: '',
      nameRule: [ v => !!v || this.$t('required') ],
      desc: ''
    }
  },
  methods: {
    editName () {
      this.name = this.user.name
      this.$refs.name.$refs.dialog.show()
    },
    async saveName () {
      this.$refs.name.$refs.dialog.hide()
      await this.$store.state.db.collection('users').doc(this.user.id).update({
        name: this.name ? this.name.trim() : '',
        updatedAt: new Date()
      })
    },
    editDesc () {
      this.desc = this.user.desc || ''
      this.$refs.desc.$refs.dialog.show()
    },
    async saveDesc () {
      this.$refs.desc.$refs.dialog.hide()
      await this.$store.state.db.collection('users').doc(this.user.id).update({
        desc: this.desc ? this.desc.trim() : '',
        updatedAt: new Date()
      })
    },
    deleteThisUser () {
      this.$refs.delete.$refs.dialog.show()
    },
    async saveDeletion () {
      this.$refs.delete.$refs.dialog.hide()
      await this.$store.state.db.collection('users').doc(this.user.id).update({
        deletedAt: new Date()
      })
    },
    restoreThisUser () {
      this.$refs.restore.$refs.dialog.show()
    },
    async saveRestoration () {
      this.$refs.restore.$refs.dialog.hide()
      await this.$store.state.db.collection('users').doc(this.user.id).update({
        deletedAt: null,
        updatedAt: new Date()
      })
    }
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
