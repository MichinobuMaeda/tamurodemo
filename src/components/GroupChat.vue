<template>
  <div>
    <q-scroll-area force-on-mobile :style="'height: ' + ($store.state.layoutSize.height - 256) + 'px'" class="q-pr-sm">
      <p v-if="!chats.length">{{ $t('noMessages') }}</p>
      <q-chat-message
        v-for="msg in chats" :key="msg.id"
        class="q-ml-sm"
        :name="user(msg.user) ? user(msg.user).name : 'unknown'"
        :sent="msg.user === me.id"
        :text="msg.text"
        :stamp="msg.ts"
      >
        <template v-slot:avatar>
          <q-btn flat round size="sm" :icon="conf.styles.iconEdit" @click="edit(msg.id)" v-if="msg.user === me.id" />
          <q-btn flat round size="sm" :icon="conf.styles.iconReply" @click="setReplyTo(replyTo)" v-if="msg.user !== me.id && msg.from" />
        </template>
      </q-chat-message>
      <q-chip color="primary" text-color="white" :icon="conf.styles.iconReply" removable v-model="isReplyTo" @remove="resetReplyTo">{{ user(replyTo).name }}</q-chip>
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

const sanitizeChatMessage = str => (str || '').trim().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />')

export default {
  name: 'GroupChat',
  props: [ 'id' ],
  components: {
    Dialog
  },
  data () {
    return {
      messages: [],
      text: '',
      msgId: '',
      msgOrg: '',
      msgNew: '',
      replyTo: '',
      isReplyTo: false
    }
  },
  methods: {
    async publish () {
      let text = this.text
      if (text) {
        const docRef = this.$store.state.db.collection('groups').doc(this.id === 'request' ? 'manager' : this.id)
        const ts = new Date()
        let data = {
          text,
          user: this.me.id,
          ts
        }
        if (this.replyTo) {
          data['from'] = this.replyTo
        }
        await docRef.collection('messages').add(data)
      }
      this.text = ''
    },
    edit (id) {
      this.msgId = id
      this.msgOrg = this.chats.reduce((ret, cur) => cur.id === id ? cur.text : ret, '')
      this.msgNew = this.msgOrg
      this.$refs.msg.$refs.dialog.show()
    },
    async saveEdited () {
      this.$refs.msg.$refs.dialog.hide()
      const docRef = this.$store.state.db.collection('groups').doc(this.id === 'request' ? 'manager' : this.id)
      if (this.msgNew.trim()) {
        await docRef.collection('messages').doc(this.msgId).update({
          text: this.msgNew.trim()
        })
      } else {
        await docRef.collection('messages').doc(this.msgId).delete()
      }
    },
    setReplyTo (id) {
      this.replyTo = id
      this.isReplyTo = true
    },
    resetReplyTo () {
      this.replyTo = ''
      this.isReplyTo = false
    }
  },
  computed: {
    chats () {
      return (this.$store.state.chatRooms[this.id] || []).map(item => ({
        ...item,
        text: [ sanitizeChatMessage(item.text) ],
        ts: this.longTimestamp(item.ts.seconds * 1000)
      }))
    },
    ...mapGetters([
      'conf',
      'me',
      'user',
      'longTimestamp'
    ])
  }
}
</script>
