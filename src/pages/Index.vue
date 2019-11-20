<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p class="text-body1" v-if="group('top') && group('top').data().desc || isAdminOrManager">
        <q-icon name="description" class="q-mr-sm" />
        <span v-if="group('top').data().desc">{{ group('top').data().desc }}</span>
        <span v-else>{{ $t('noDesc') }}</span>
        <q-btn flat raund icon="edit" @click="openDescEditor" />
      </p>
      <p :class="conf.styles.pageTitle">
        <q-icon name="people" />
        {{ $t('groups') }}
        <q-btn flat raund icon="add" @click="openNameEditor" />
      </p>
      <q-list>
        <div v-for="group in $store.state.groups" v-bind:key="group.id">
          <q-item
            v-if="!['top', 'manager', 'admin'].includes(group.id) && (isAdminOrManager || (!group.data().deletedAt))"
            clickable v-ripple :to="'/groups/' + group.id"
          >
            <q-item-section avatar>
              <q-icon name="delete" v-if="group.data().deletedAt" />
              <q-icon name="people" v-else />
            </q-item-section>
            <q-item-section>{{ group.data().name }}</q-item-section>
          </q-item>
        </div>
        <q-item clickable v-ripple to="/groups/manager">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>{{ group('manager') && group('manager').data().name }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/groups/admin">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>{{ group('admin') && group('admin').data().name }}</q-item-section>
        </q-item>
      </q-list>
    </div>
    <q-dialog v-model="nameEditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="group_add" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('group') }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus type="text" v-model="name" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="primary" :label="$t('save')" @click="saveName" :disable="(!name)" />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="descditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar icon="edit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('desc') }}</span>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus outlined class="q-mt-sm" type="textarea" v-model="desc" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="primary" :label="$t('ok')" @click="saveDesc" :disable="desc === (group('top') && group('top').data().desc)" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageIndex',
  data () {
    return {
      name: '',
      nameEditor: false,
      desc: '',
      descditor: false
    }
  },
  methods: {
    openNameEditor () {
      this.name = ''
      this.nameEditor = true
    },
    async saveName () {
      this.nameEditor = false
      let group = await this.$store.state.db.collection('groups').add({
        name: this.name,
        members: [],
        subGroups: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      let topRef = this.$store.state.db.collection('groups').doc('top')
      let top = await topRef.get()
      await topRef.update({
        subGroups: [ ...top.data().subGroups, group.id ],
        updatedAt: new Date()
      })
    },
    openDescEditor () {
      this.desc = this.group('top').data().desc
      this.descditor = true
    },
    async saveDesc () {
      this.descditor = false
      await this.$store.state.db.collection('groups').doc('top').update({
        desc: this.desc ? this.desc.trim() : '',
        updatedAt: new Date()
      })
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'group',
      'isAdminOrManager'
    ])
  }
}
</script>
