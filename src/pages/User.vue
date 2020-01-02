<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconUser" />
        {{ user($route.params.id).name }}
        <q-btn
          v-if="isManager && ($route.params.id !== me.id) && !user($route.params.id).deletedAt"
          flat raund :icon="conf.styles.iconRemove"
          @click="confirmDelete = true"
        />
      </p>
      <p v-if="isManager && ($route.params.id !== me.id) && user($route.params.id).deletedAt" class="text-negative">
        <q-icon :name="conf.styles.iconRemove" class="q-mr-sm" />
        {{ $t('deleted') }}
        <q-btn flat raund :icon="conf.styles.iconRestore" @click="confirmRestore = true" />
      </p>
      <span v-for="g in groups" v-bind:key="g.id">
        <q-btn
          v-if="g.members.includes($route.params.id)"
          class="q-ma-xs" rounded
          :icon="conf.styles.iconGroup" :label="g.name"
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
          <q-avatar :icon="conf.styles.iconRemove" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('delete') }}</span>
          <q-space />
          <q-btn :icon="conf.styles.iconClose" flat round dense v-close-popup />
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
          <q-avatar :icon="conf.styles.iconRestore" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('restore') }}</span>
          <q-space />
          <q-btn :icon="conf.styles.iconClose" flat round dense v-close-popup />
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
      'me',
      'user',
      'groups',
      'account',
      'isAdminOrManager',
      'isManager'
    ])
  }
}
</script>
