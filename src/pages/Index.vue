<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <ItemDesc :item="group('top')" :collection="'groups'" />
      <GroupChat :item="group('top')" />

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
import ItemDesc from '../components/ItemDesc'
import GroupChat from '../components/GroupChat'

export default {
  name: 'PageIndex',
  components: {
    Dialog,
    ItemDesc,
    GroupChat
  },
  data () {
    return {
      name: '',
      nameRule: [ v => !!v || this.$t('required') ],
      desc: ''
    }
  },
  methods: {
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
