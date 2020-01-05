<template>
  <span class="q-ml-md">
    <q-btn
      v-if="isManager || (collection === 'users' && item.id === me.id)"
      flat round dense :color="conf.styles.headerText" class="q-mr-sm"
      :icon="conf.styles.iconEdit"
      @click="editName"
    />
    <Dialog ref="name" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
      <q-card-section>
        <q-input type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
      </q-card-section>
      <q-card-section align="right">
        <q-btn
          color="primary" no-caps :label="$t('save')"
          @click="saveName" :disable="!name || name === item.name"
        />
      </q-card-section>
    </Dialog>
  </span>
 </template>

<script>
import { mapGetters } from 'vuex'
import Dialog from './Dialog'

export default {
  name: 'ItemName',
  props: [ 'item', 'collection' ],
  components: {
    Dialog
  },
  data () {
    return {
      name: '',
      nameRule: [ v => !!v || this.$t('required') ]
    }
  },
  methods: {
    editName () {
      this.name = this.item.name || ''
      this.$refs.name.$refs.dialog.show()
    },
    async saveName () {
      this.$refs.name.$refs.dialog.hide()
      await this.$store.state.db.collection(this.collection).doc(this.item.id).update({
        name: this.name ? this.name.trim() : '',
        updatedAt: new Date()
      })
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'me',
      'isManager'
    ])
  }
}
</script>
