<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm">
      <div :class="conf.styles.pageTitle + (group.deletedAt ? ' bg-grey-5' : '')">
        <q-avatar :icon="group.deletedAt ? conf.styles.iconRemove : conf.styles.iconGroup" />
        {{ group.name }}

        <q-btn
          v-if="isManager"
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
              @click="saveName" :disable="!name || name === group.name"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          v-if="isManager && !group.deletedAt"
          flat raund :icon="conf.styles.iconRemove"
          @click="deleteThisGroup"
        />
        <Dialog ref="delete" :color="'negative'" :icon="conf.styles.iconRemove" :title="$t('delete')">
          <q-card-section>
            <div>{{ $t('confirmGroupDeletion') }}</div>
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="negative" no-caps :label="$t('ok')" @click="saveDeletion"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          v-if="isManager && group.deletedAt"
          flat raund :icon="conf.styles.iconRestore"
          @click="restoreThisGroup"
        />
        <Dialog ref="restore" :color="'negative'" :icon="conf.styles.iconRestore" :title="$t('restore')">
          <q-card-section>
            <div>{{ $t('confirmGroupRestore') }}</div>
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="negative" no-caps :label="$t('ok')" @click="saveRestoration"
            />
          </q-card-section>
        </Dialog>

      </div>

      <q-banner class="bg-grey-3" v-if="group && group.desc || isManager">
        <q-btn class="float-right" flat raund :icon="conf.styles.iconEdit" @click="editDesc" />
        <Dialog ref="desc" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-input type="textarea" v-model="desc" :label="$t('desc')" />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveDesc" :disable="desc === group.desc"
            />
          </q-card-section>
        </Dialog>
        <div v-if="group.desc">
          <p v-for="(line, index) in group.desc.split('\n')" :key="index">{{ line }}</p>
        </div>
        <div v-else>{{ $t('noDesc') }}</div>
      </q-banner>

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

export default {
  name: 'PageGroup',
  components: {
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
      this.name = this.group.name
      this.$refs.name.$refs.dialog.show()
    },
    async saveName () {
      this.$refs.name.$refs.dialog.hide()
      await this.$store.state.db.collection('groups').doc(this.group.id).update({
        name: this.name ? this.name.trim() : '',
        updatedAt: new Date()
      })
    },
    editDesc () {
      this.desc = this.group.desc || ''
      this.$refs.desc.$refs.dialog.show()
    },
    async saveDesc () {
      this.$refs.desc.$refs.dialog.hide()
      await this.$store.state.db.collection('groups').doc(this.group.id).update({
        desc: this.desc ? this.desc.trim() : '',
        updatedAt: new Date()
      })
    },
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
    },
    deleteThisGroup () {
      this.$refs.delete.$refs.dialog.show()
    },
    async saveDeletion () {
      this.$refs.delete.$refs.dialog.hide()
      await this.$store.state.db.collection('groups').doc(this.group.id).update({
        deletedAt: new Date()
      })
    },
    restoreThisGroup () {
      this.$refs.restore.$refs.dialog.show()
    },
    async saveRestoration () {
      this.$refs.restore.$refs.dialog.hide()
      await this.$store.state.db.collection('groups').doc(this.group.id).update({
        deletedAt: null,
        updatedAt: new Date()
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
