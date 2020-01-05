<template>
  <q-page class="row justify-center">
    <div class="col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm">
      <q-banner class="bg-grey-3" v-if="group('top') && group('top').desc || isAdminOrManager">
        <q-btn class="float-right" flat raund :icon="conf.styles.iconEdit" @click="editDesc" />
        <Dialog ref="desc" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-input type="textarea" v-model="desc" :label="$t('desc')" />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveDesc" :disable="desc === group('top').desc"
            />
          </q-card-section>
        </Dialog>
        <div v-if="group('top').desc">
          <p v-for="(line, index) in group('top').desc.split('\n')" :key="index">{{ line }}</p>
        </div>
        <div v-else>{{ $t('noDesc') }}</div>
      </q-banner>

      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconGroup" />
        {{ $t('groups') }}
        <q-btn flat raund :icon="conf.styles.iconAdd" @click="createGroup" />
      </p>
      <Dialog ref="create" :color="'primary'" :icon="conf.styles.iconAdd" :title="$t('add')">
        <q-card-section>
          <q-input type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
        </q-card-section>
        <q-card-section align="right">
          <q-btn
            color="primary" no-caps :label="$t('save')"
            @click="saveGroup" :disable="!name || name === user(me.id).name"
          />
        </q-card-section>
      </Dialog>

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

  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'
import Dialog from '../components/Dialog'

export default {
  name: 'PageIndex',
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
    editDesc () {
      this.desc = this.group('top').desc || ''
      this.$refs.desc.$refs.dialog.show()
    },
    async saveDesc () {
      this.$refs.desc.$refs.dialog.hide()
      await this.$store.state.db.collection('groups').doc('top').update({
        desc: this.desc ? this.desc.trim() : '',
        updatedAt: new Date()
      })
    },
    createGroup () {
      this.name = ''
      this.$refs.create.$refs.dialog.show()
    },
    async saveGroup () {
      this.$refs.create.$refs.dialog.hide()
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
