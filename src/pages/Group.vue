<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-avatar icon="fas fa-users" />
        {{ group($route.params.id).name }}
        <q-btn
          v-if="isManager"
          flat raund icon="fas fa-edit"
          @click="openNameEditor"
        />
        <q-btn
          v-if="isManager && !group($route.params.id).deletedAt"
          flat raund icon="fas fa-minus-circle"
          @click="confirmDelete = true"
        />
      </p>
      <p v-if="isManager && group($route.params.id).deletedAt" class="text-negative">
        <q-icon name="fas fa-minus-circle" class="q-mr-sm" />
        {{ $t('deleted') }}
        <q-btn flat raund icon="fas fa-trash-restore" @click="confirmRestore = true" />
      </p>
      <p class="text-body1" v-if="group($route.params.id).desc || isManager">
        <q-icon name="far fa-comment-alt" class="q-mr-sm" />
        <span v-if="group($route.params.id).desc">{{ group($route.params.id).desc }}</span>
        <span v-else>{{ $t('noDesc') }}</span>
        <q-btn flat raund icon="fas fa-edit" @click="openDescEditor" />
      </p>
      <q-list>
        <q-item
          v-if="isManager"
          clickable v-ripple @click="openMenberEditor"
          class="text-primary"
        >
          <q-item-section avatar><q-icon name="fas fa-user-plus" /></q-item-section>
          <q-item-section>{{ $t('addMember') }}</q-item-section>
        </q-item>
        <div v-for="u in users" v-bind:key="u.id">
          <q-item
            v-if="group($route.params.id).members.includes(u.id) && (isAdminOrManager || (!u.deletedAt))"
            clickable v-ripple :to="{ name: 'user', params: { id: u.id } }"
          >
            <q-item-section avatar>
              <q-icon name="fas fa-minus-circle" v-if="u.deletedAt" />
              <q-icon name="fas fa-user" v-else />
            </q-item-section>
            <q-item-section>{{ u.name }}</q-item-section>
            <q-item-section avatar>
              <q-avatar v-if="isAdminOrManager">
                <q-icon :name="accountStatus(u.id)" />
              </q-avatar>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </div>

    <q-dialog v-model="nameEditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="fas fa-edit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('name') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus type="text" v-model="name" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn
            color="primary"
            :label="$t('ok')" @click="saveName"
            :disable="(!name) || name === group($route.params.id).name"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="descditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="fas fa-edit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('desc') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus outlined class="q-mt-sm" type="textarea" v-model="desc" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn
            color="primary"
            :label="$t('ok')" @click="saveDesc"
            :disable="desc === group($route.params.id).desc"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="memberEditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="fas fa-edit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('addMember') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus type="text" :label="$t('name')" v-model="member" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn
            color="primary"
            :label="$t('ok')" @click="saveMember"
            :disable="!member"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDelete">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="fas fa-minus-circle" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('delete') }}</span>
          <q-space />
          <q-btn icon="fas fa-times" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section glass="text-negative">
          {{ $t('confirmGroupDeletion') }}
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="negative" :label="$t('delete')" @click="deleteThisGroup" />
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
          {{ $t('confirmGroupRestore') }}
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="negative" :label="$t('restore')" @click="restoreThisGroup" />
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageGroup',
  data () {
    return {
      name: '',
      nameEditor: false,
      desc: '',
      descditor: false,
      confirmDelete: false,
      confirmRestore: false,
      member: '',
      memberEditor: false
    }
  },
  methods: {
    openNameEditor () {
      this.name = this.group(this.$route.params.id).name
      this.nameEditor = true
    },
    async saveName () {
      this.nameEditor = false
      await this.$store.state.db.collection('groups').doc(this.$route.params.id).update({
        name: this.name,
        updatedAt: new Date()
      })
    },
    openDescEditor () {
      this.desc = this.group(this.$route.params.id).desc
      this.descditor = true
    },
    async saveDesc () {
      this.descditor = false
      await this.$store.state.db.collection('groups').doc(this.$route.params.id).update({
        desc: this.desc ? this.desc.trim() : '',
        updatedAt: new Date()
      })
    },
    openMenberEditor () {
      this.member = ''
      this.memberEditor = true
    },
    async saveMember () {
      this.memberEditor = false
      await this.$store.state.firebase.functions().httpsCallable('createMember')({
        id: this.$route.params.id,
        name: this.member
      })
    },
    async deleteThisGroup () {
      this.confirmDelete = false
      await this.$store.state.db.collection('groups').doc(this.$route.params.id).update({
        deletedAt: new Date()
      })
    },
    async restoreThisGroup () {
      this.confirmRestore = false
      await this.$store.state.db.collection('groups').doc(this.$route.params.id).update({
        deletedAt: null,
        updatedAt: new Date()
      })
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'group',
      'users',
      'accountStatus',
      'isAdminOrManager',
      'isManager'
    ])
  }
}
</script>
