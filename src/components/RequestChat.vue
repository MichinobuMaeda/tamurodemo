<template>
  <div>
    <q-btn
      v-if="messages.length > 3"
      outline class="full-width q-my-sm" size="sm" color="secondary"
      :icon="expand ? 'fas fa-chevron-down' : 'fas fa-chevron-up'"
      @click="expand = !expand"
    />
    <q-scroll-area force-on-mobile style="height: 480px" class="q-mx-sm q-pr-md">
      <q-chat-message
        v-for="msg in messages" :key="msg.id"
        text-sanitize
        :name="user(msg.user) ? user(msg.user).name : 'unknown'"
        :sent="msg.user === me.id"
        :text="msg.text.split('\n')"
        :stamp="msg.ts"
      >
        <template v-slot:avatar v-if="msg.user === me.id">
          <q-btn flat size="sm" :icon="conf.styles.iconEdit" @click="edit(msg.id)" />
        </template>
      </q-chat-message>
      <q-input type="textarea" outlined v-model="text" autofocus style="height: 64px">
        <template v-slot:after>
          <q-btn round dense flat :icon="conf.styles.iconSend" color="primary" @click="publish" :disable="!text" />
        </template>
      </q-input>
    </q-scroll-area>

    <Dialog ref="msg" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
      <q-card-section>
        <q-input outlined type="textarea" v-model="msgNew" />
      </q-card-section>
      <q-card-section align="right">
        <q-btn
          color="primary" no-caps :label="$t('save')"
          @click="saveEdited" :disable="msgNew === msgOrg"
        />
      </q-card-section>
    </Dialog>

  </div>
 </template>

<script>
import { mapGetters } from 'vuex'
import Dialog from './Dialog'

export default {
  name: 'RequestChat',
  props: [ 'item', 'from' ],
  components: {
    Dialog
  },
  data () {
    return {
      messages: [],
      text: '',
      msgId: '',
      msgOrg: '',
      msgNew: ''
    }
  },
  mounted () {
    this.$store.state.db.collection('groups').doc(this.item.id).collection('messages').where('from', '==', this.from).orderBy('ts').onSnapshot(querySnapshot => {
      this.messages = querySnapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      })).map(item => ({
        ...item,
        ts: this.longTimestamp(item.ts.seconds * 1000)
      }))
    })
  },
  methods: {
    async publish () {
      let text = this.text.trim()
      if (text) {
        const ts = new Date()
        await this.$store.state.db.collection('groups').doc(this.item.id).collection('messages').add({
          text,
          user: this.me.id,
          from: this.from,
          ts
        })
      }
      this.text = ''
    },
    edit (id) {
      this.msgId = id
      this.msgOrg = this.messages.reduce((ret, cur) => cur.id === id ? cur.text : ret, '')
      this.msgNew = this.msgOrg
      this.$refs.msg.$refs.dialog.show()
    },
    async saveEdited () {
      this.$refs.msg.$refs.dialog.hide()
      if (this.msgNew.trim()) {
        await this.$store.state.db.collection('groups').doc(this.item.id).collection('messages').doc(this.msgId).update({
          text: this.msgNew
        })
      } else {
        await this.$store.state.db.collection('groups').doc(this.item.id).collection('messages').doc(this.msgId).delete()
      }
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'me',
      'user',
      'longTimestamp'
    ])
  }
}
</script>
