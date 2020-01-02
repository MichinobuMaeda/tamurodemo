<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm">
      <p class="text-body1" v-if="group('top') && group('top').desc || isAdminOrManager">
        <q-icon :name="conf.styles.iconDesc" class="q-mr-sm" />
        <span v-if="group('top').desc">{{ group('top').desc }}</span>
        <span v-else>{{ $t('noDesc') }}</span>
        <q-btn flat raund :icon="conf.styles.iconEdit" @click="openDescEditor" />
      </p>
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconGroup" />
        {{ $t('groups') }}
        <q-btn flat raund :icon="conf.styles.iconAdd" @click="openNameEditor" />
      </p>
      <q-list>
        <div v-for="g in groups" v-bind:key="g.id">
          <q-item
            v-if="!['top', 'manager', 'admin'].includes(g.id) && (isAdminOrManager || (!g.deletedAt))"
            clickable v-ripple :to="{ name: 'group', params: { id: g.id } }"
          >
            <q-item-section avatar>
              <q-icon :name="conf.styles.iconRemove" v-if="g.deletedAt" />
              <q-icon :name="conf.styles.iconGroup" v-else />
            </q-item-section>
            <q-item-section>{{ g.name }}</q-item-section>
          </q-item>
        </div>
        <q-item clickable v-ripple :to="{ name: 'group', params: { id: 'manager' } }">
          <q-item-section avatar><q-icon :name="conf.styles.iconGroup" /></q-item-section>
          <q-item-section>{{ group('manager') && group('manager').name }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="{ name: 'group', params: { id: 'admin' } }">
          <q-item-section avatar><q-icon :name="conf.styles.iconGroup" /></q-item-section>
          <q-item-section>{{ group('admin') && group('admin').name }}</q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-dialog v-model="nameEditor">
      <q-card :style="conf.styles.dlgCardStyle">
        <q-card-section :class="conf.styles.dlgTitle">
          <q-avatar :icon="conf.styles.iconAdd" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('group') }}</span>
          <q-space />
          <q-btn :icon="conf.styles.iconClose" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus type="text" :label="$t('name')" v-model="name" />
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
          <q-avatar :icon="conf.styles.iconEdit" :text-color="conf.styles.dlgTitleIconColor" />
          <span :class="conf.styles.dlgTitleText">{{ $t('desc') }}</span>
          <q-space />
          <q-btn :icon="conf.styles.iconClose" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-input autofocus outlined class="q-mt-sm" type="textarea" v-model="desc" />
        </q-card-section>
        <q-card-section class="row items-center">
          <q-space />
          <q-btn color="primary" :label="$t('ok')" @click="saveDesc" :disable="desc === (group('top') && group('top').desc)" />
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
      'groups',
      'isAdminOrManager'
    ])
  }
}
</script>
