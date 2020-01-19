<template>
  <div>
    <q-scroll-area
      ref="chatArea"
      class="q-pr-sm" :style="'height: ' + ($store.state.layoutSize.height - 256) + 'px'"
      force-on-mobile
    >
      <div id="chatTarget">
        <p v-if="!chats.length">{{ $t('noMessages') }}</p>
        <div v-for="msg in chats" :key="msg.id">
          <q-chat-message
            v-if="msg.path"
            class="q-ml-sm"
            bg-color="white"
            :name="messageTitle(msg)"
            :sent="msg.user === me.id"
            :stamp="msg.ts"
          >
            <template v-slot:avatar>
              <q-btn
                v-if="msg.user === me.id"
                flat round color="primary"
                :icon="conf.styles.iconRemove"
                @click="showRemoveImage(msg.id)"
              />
            </template>
            <template>
              <img
                style="max-width: 320px;"
                :src="$store.state.chatImages[id + ':' + msg.id]"
                @load="onImageLoaded"
              />
            </template>
          </q-chat-message>
          <q-chat-message
            v-else
            class="q-ml-sm"
            :name="messageTitle(msg)"
            :sent="msg.user === me.id"
            :text="msg.text"
            :stamp="msg.ts"
          >
            <template v-slot:avatar>
              <div v-if="msg.user">
                <q-btn
                  v-if="msg.user === me.id"
                  flat round size="sm" color="primary"
                  :icon="conf.styles.iconEdit"
                  @click="edit(msg.id)"
                />
                <br v-if="msg.user === me.id" />
                <q-btn
                  v-if="msg.user !== me.id && msg.from"
                  flat round size="sm" color="primary"
                  :icon="conf.styles.iconInquire"
                  @click="setReplyTo(msg.user)"
                />
                <br v-if="msg.user !== me.id && msg.from" />
                <q-btn
                  v-if="!msg.from"
                  flat round size="sm" color="pink"
                  :icon="conf.styles.iconFav"
                  @click="toggleFav(msg)"
                >
                  <q-badge color="white" text-color="pink" floating transparent v-if="msg.fav && msg.fav.length">
                    {{ msg.fav.length }}
                  </q-badge>
                </q-btn>
              </div>
              <q-avatar v-else>
                <q-icon color="negative" name="notification_important" />
              </q-avatar>
            </template>
          </q-chat-message>
        </div>
        <q-chip
          color="primary" text-color="white"
          :icon="conf.styles.iconInquire"
          v-model="isReplyTo"
          removable @remove="resetReplyTo"
        >
          {{ $t('replyTo', { name: user(replyTo).name }) }}
        </q-chip>
        <q-input ref="message" type="textarea" outlined v-model="text" autofocus style="height: 64px">
        </q-input>
        <q-btn
          class="float-right q-mx-sm"
          round dense flat color="primary"
          :icon="conf.styles.iconSend"
          @click="publish"
          :disable="!text"
        />
        <q-btn
          class="float-right q-mx-sm"
          round dense flat color="secondary"
          :icon="conf.styles.iconUploadImage"
          @click="showUpload"
        />

        <q-dialog ref="upload">
          <q-uploader
            url="http://localhost:4444/upload"
            :label="$t('upload')"
            color="secondary"
            text-color="white"
            :filter="checkUploadFile"
            style="max-width: 480px"
            :factory="upload"
          />
        </q-dialog>
      </div>
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

    <Dialog ref="removeImage" :color="'negative'" :icon="conf.styles.iconRemove" :title="$t('remove')">
      <q-card-section>
        <img
          style="max-width: 320px;"
          :src="$store.state.chatImages[id + ':' + msgId]"
        />
      </q-card-section>
      <q-card-section align="right">
        <q-btn
          color="negative" no-caps :label="$t('remove')"
          @click="removeImage"
        />
      </q-card-section>
    </Dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Dialog from './Dialog'
import Firebase from 'firebase/app'
import 'firebase/firestore'

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
    onImageLoaded () {
      this.$refs.chatArea.setScrollPosition(document.getElementById('chatTarget').clientHeight)
    },
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
      this.$refs.message.focus()
    },
    resetReplyTo () {
      this.replyTo = ''
      this.isReplyTo = false
    },
    showUpload () {
      this.$refs.upload.show()
    },
    upload (files) {
      this.$refs.upload.hide()
      return Promise.all(files.map(async file => {
        const ext = file.type === 'image/jpeg' ? '.jpg' : (file.type === 'image/png' ? '.png' : '.bin')
        const ts = (new Date()).toISOString().replace(/\D/g, '')
        const path = 'images/' + this.id + '/' + this.me.id + ts + ext
        const storageRef = this.$store.state.storage.ref()
        const spaceRef = storageRef.child(path)
        await spaceRef.put(file)
        const docRef = this.$store.state.db.collection('groups').doc(this.id === 'request' ? 'manager' : this.id)
        await docRef.collection('messages').add({
          path,
          user: this.me.id,
          ts
        })
      }))
    },
    showRemoveImage (id) {
      this.msgId = id
      this.$refs.removeImage.$refs.dialog.show()
    },
    async removeImage () {
      this.$refs.removeImage.$refs.dialog.hide()
      const docRef = this.$store.state.db.collection('groups').doc(this.id === 'request' ? 'manager' : this.id)
      await docRef.collection('messages').doc(this.msgId).delete()
    },
    checkUploadFile (files) {
      return files.filter(
        file => file.size < this.$store.state.service.conf.uploadSize
      ).filter(
        file => this.$store.state.service.conf.uploadMimeType.includes(file.type)
      )
    },
    sanitize (str) {
      return (str || '').trim().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />')
    },
    messageTitle (msg) {
      const from = (msg.from && msg.from !== msg.user) ? this.sanitize(this.user(msg.from) ? this.user(msg.from).name : '') : ''
      return (from ? (from + ' &laquo; ') : '') + this.sanitize(this.user(msg.user) ? this.user(msg.user).name : 'unknown')
    },
    async toggleFav (msg) {
      const docRef = this.$store.state.db.collection('groups').doc(this.id === 'request' ? 'manager' : this.id)
      if (!msg.fav) {
        await docRef.collection('messages').doc(msg.id).update({
          fav: [ this.me.id ]
        })
      } else if ((msg.fav || []).includes(this.me.id)) {
        await docRef.collection('messages').doc(msg.id).update({
          fav: Firebase.firestore.FieldValue.arrayRemove(this.me.id)
        })
      } else {
        await docRef.collection('messages').doc(msg.id).update({
          fav: Firebase.firestore.FieldValue.arrayUnion(this.me.id)
        })
      }
    },
    async toggleLike (msg) {
      const docRef = this.$store.state.db.collection('groups').doc(this.id === 'request' ? 'manager' : this.id)
      if (!msg.like) {
        await docRef.collection('messages').doc(msg.id).update({
          like: [ this.me.id ]
        })
      } else if ((msg.like || []).includes(this.me.id)) {
        await docRef.collection('messages').doc(msg.id).update({
          like: Firebase.firestore.FieldValue.arrayRemove(this.me.id)
        })
      } else {
        await docRef.collection('messages').doc(msg.id).update({
          like: Firebase.firestore.FieldValue.arrayUnion(this.me.id)
        })
      }
    }
  },
  computed: {
    chats () {
      return (this.$store.state.chatRooms[this.id] || []).map(item => ({
        ...item,
        text: [ this.sanitize(item.text) ],
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
