<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-avatar icon="fas fa-user" />
        {{ user($route.params.id).name }}
        <q-btn
          v-if="isManager && ($route.params.id !== $store.state.me.id) && !user($route.params.id).deletedAt"
          flat raund icon="fas fa-minus-circle"
          @click="confirmDelete = true"
        />
      </p>
      <p v-if="isManager && ($route.params.id !== $store.state.me.id) && user($route.params.id).deletedAt" class="text-negative">
        <q-icon name="fas fa-minus-circle" class="q-mr-sm" />
        {{ $t('deleted') }}
        <q-btn flat raund icon="fas fa-trash-restore" @click="confirmRestore = true" />
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

    <q-dialog v-model="confirmDelete">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="fas fa-minus-circle" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('delete') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section glass="text-negative">
          {{ $t('confirmUserDeletion') }}
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="negative" :label="$t('delete')" @click="deleteThisUser" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmRestore">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="fas fa-trash-restore" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('restore') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section glass="text-negative">
          {{ $t('confirmUserRestore') }}
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="negative" :label="$t('restore')" @click="restoreThisUser" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import AccountAdmin from '../components/AccountAdmin'

export default {
  name: 'PageUser',
  data () {
    return {
      name: '',
      nameEditor: false,
      desc: '',
      descditor: false,
      confirmDelete: false,
      confirmRestore: false
    }
  },
  components: {
    AccountAdmin
  },
  methods: {
    async deleteThisUser () {
      this.confirmDelete = false
      await this.$store.state.db.collection('users').doc(this.$route.params.id).update({
        deletedAt: new Date()
      })
    },
    async restoreThisUser () {
      this.confirmRestore = false
      await this.$store.state.db.collection('users').doc(this.$route.params.id).update({
        deletedAt: null,
        updatedAt: new Date()
      })
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'user',
      'groups',
      'account',
      'isAdminOrManager',
      'isManager'
    ])
  }
}
</script>
