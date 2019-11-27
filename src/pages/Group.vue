<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="fas fa-users" />
        {{ group($route.params.id).data().name }}
        <q-btn
          flat raund icon="fas fa-edit"
          @click="openNameEditor"
        />
        <q-btn
          v-if="!group($route.params.id).data().deletedAt"
          flat raund icon="fas fa-minus-circle"
          @click="confirmDelete = true"
        />
      </p>
      <p v-if="group($route.params.id).data().deletedAt" class="text-negative">
        <q-icon name="fas fa-minus-circle" class="q-mr-sm" />
        {{ $t('deleted') }}
        <q-btn flat raund icon="fas fa-trash-restore" @click="confirmRestore = true" />
      </p>
      <p class="text-body1" v-if="group($route.params.id).data().desc || isManager">
        <q-icon name="far fa-comment-alt" class="q-mr-sm" />
        <span v-if="group($route.params.id).data().desc">{{ group($route.params.id).data().desc }}</span>
        <span v-else>{{ $t('noDesc') }}</span>
        <q-btn flat raund icon="fas fa-edit" @click="openDescEditor" />
      </p>
      <q-list>
        <div v-for="user in ($store.state.users || [])" v-bind:key="user.id">
          <q-item
            v-if="group($route.params.id).data().members.includes(user.id)"
            clickable v-ripple :to="{ name: 'user', params: { id: user.id } }"
          >
            <q-item-section avatar><q-icon name="fas fa-user" /></q-item-section>
            <q-item-section>{{ user.data().name }}</q-item-section>
            <q-item-section avatar>
              <q-avatar v-if="isAdminOrManager">
                <q-icon :name="accountStatus(user.id)" />
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
            :disable="(!name) || name === group($route.params.id).data().name"
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
            :disable="desc === group($route.params.id).data().desc"
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
          {{ $t('confirmDeletion') }}
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
          {{ $t('confirmRestore') }}
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
      confirmRestore: false
    }
  },
  methods: {
    openNameEditor () {
      this.name = this.group(this.$route.params.id).data().name
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
      this.desc = this.group(this.$route.params.id).data().desc
      this.descditor = true
    },
    async saveDesc () {
      this.descditor = false
      await this.$store.state.db.collection('groups').doc(this.$route.params.id).update({
        desc: this.desc ? this.desc.trim() : '',
        updatedAt: new Date()
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
      'accountStatus',
      'isAdminOrManager',
      'isManager'
    ])
  }
}
</script>
