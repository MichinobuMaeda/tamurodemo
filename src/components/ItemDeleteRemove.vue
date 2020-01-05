<template>
  <span v-if="showElement">
    <q-btn
      v-if="!item.deletedAt"
      flat raund :icon="conf.styles.iconRemove"
      @click="deleteThisItem"
    />
    <Dialog ref="delete" :color="'negative'" :icon="conf.styles.iconRemove" :title="$t('delete')">
      <q-card-section>
        <div>{{ $t(this.collection === 'users' ? 'confirmUserDeletion' : 'confirmGroupDeletion') }}</div>
      </q-card-section>
      <q-card-section align="right">
        <q-btn
          color="negative" no-caps :label="$t('ok')" @click="saveDeletion"
        />
      </q-card-section>
    </Dialog>

    <q-btn
      v-if="item.deletedAt"
      flat raund :icon="conf.styles.iconRestore"
      @click="restoreThisItem"
    />
    <Dialog ref="restore" :color="'negative'" :icon="conf.styles.iconRestore" :title="$t('restore')">
      <q-card-section>
        <div>{{ $t(this.collection === 'users' ? 'confirmUserRestore' : 'confirmGroupRestore') }}</div>
      </q-card-section>
      <q-card-section align="right">
        <q-btn
          color="negative" no-caps :label="$t('ok')" @click="saveRestoration"
        />
      </q-card-section>
    </Dialog>
  </span>
 </template>

<script>
import { mapGetters } from 'vuex'
import Dialog from './Dialog'

export default {
  name: 'ItemDeleteRemove',
  props: [ 'item', 'collection' ],
  components: {
    Dialog
  },
  data () {
    return {
    }
  },
  methods: {
    deleteThisItem () {
      this.$refs.delete.$refs.dialog.show()
    },
    async saveDeletion () {
      this.$refs.delete.$refs.dialog.hide()
      await this.$store.state.db.collection(this.collection).doc(this.item.id).update({
        deletedAt: new Date()
      })
    },
    restoreThisItem () {
      this.$refs.restore.$refs.dialog.show()
    },
    async saveRestoration () {
      this.$refs.restore.$refs.dialog.hide()
      await this.$store.state.db.collection(this.collection).doc(this.item.id).update({
        deletedAt: null,
        updatedAt: new Date()
      })
    }
  },
  computed: {
    showElement () {
      return this.isManager &&
      !(this.collection === 'users' && this.item.id === this.me.id) &&
      !(this.collection === 'groups' && [ 'top', 'admin', 'manager' ].includes(this.item.id))
    },
    ...mapGetters([
      'conf',
      'me',
      'isManager'
    ])
  }
}
</script>
