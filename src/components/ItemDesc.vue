<template>
  <q-banner class="bg-grey-3 q-my-sm" v-if="item && item.desc || isManager || (collection === 'users' && item.id === me.id)">
    <q-btn class="float-right" flat round :icon="conf.styles.iconEdit" @click="editDesc" />
    <Dialog ref="desc" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
      <q-card-section>
        <q-input outlined type="textarea" v-model="desc" :label="$t('desc')" />
      </q-card-section>
      <q-card-section align="right">
        <q-btn
          color="primary" no-caps :label="$t('save')"
          @click="saveDesc" :disable="desc === item.desc"
        />
      </q-card-section>
    </Dialog>
    <div v-if="item.desc">
      <p v-for="(line, index) in item.desc.split('\n')" :key="index">{{ line }}</p>
    </div>
    <div v-else>{{ $t('noDesc') }}</div>
  </q-banner>
</template>

<script>
import { mapGetters } from 'vuex'
import Dialog from './Dialog'

export default {
  name: 'ItemDesc',
  props: [ 'item', 'collection' ],
  components: {
    Dialog
  },
  data () {
    return {
      desc: ''
    }
  },
  methods: {
    editDesc () {
      this.desc = this.item.desc || ''
      this.$refs.desc.$refs.dialog.show()
    },
    async saveDesc () {
      this.$refs.desc.$refs.dialog.hide()
      await this.$store.state.db.collection(this.collection).doc(this.item.id).update({
        desc: this.desc ? this.desc.trim() : '',
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
