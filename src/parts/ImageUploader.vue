<template>
  <div>
    <v-file-input
      :prepend-icon="conf.icon('Add photo') "
      multiple
      autofocus
      v-model="page.files"
      :placeholder="$t('up to n images', { count: state.uploadFileCountMax })"
    >
      <template v-slot:append-outer>
        <v-btn
          icon
          color="primary"
          @click="upload"
          :disabled="page.sending || (!(page.files && page.files.some(file => isImageFile(file.name)))) || page.files.filter(file => isImageFile(file.name)).length > state.uploadFileCountMax"
        >
          <v-icon>{{ conf.icon('Send') }}</v-icon>
        </v-btn>
      </template>
    </v-file-input>
    <div v-if="page.sending">
      <v-progress-circular
        indeterminate
        size="64"
        color="info"
        class="mb-2"
      />
      Sending ...
    </div>
    <v-alert
      v-if="page.files && page.files.filter(file => isImageFile(file.name)).length > state.uploadFileCountMax"
      type="error"
      text
    >
      {{ $t('You can upload up to n images', { count: state.uploadFileCountMax }) }}
    </v-alert>
    <v-simple-table v-else>
      <template v-slot:default>
        <tbody>
          <tr v-for="(file, index) in page.files" :key="index">
            <td class="text-right">
              <v-btn
                v-if="isImageFile(file.name)"
                icon
                color="primary"
                class="float-right"
                @click="rotate(index)"
                :disabled="page.sending"
              >
                <v-icon>{{ conf.icon('Rotate image') }}</v-icon>
              </v-btn>
            </td>
            <td :style="isImageFile(file.name) ? `line-height: ${state.messageThumbnailHeight + 4}px; text-align: center;` : 'text-align: center;'">
              <img
                v-if="isImageFile(file.name)"
                :style="`transform: rotate(${page.degs[index] || 0}deg); max-height: ${state.messageThumbnailHeight}px; max-width: ${state.messageThumbnailWidth}px; vertical-align: middle;`"
                :src="fileToUrl(file)"
                :alt="file.name"
              />
              <v-icon v-else>{{ conf.icon('Broken image') }}</v-icon>
            </td>
            <td>
              {{ file.name }}
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
import { useStore } from '@/store'
import { reactive } from '@vue/composition-api'

export default {
  name: 'ImageUploader',
  props: {
    summary: String,
    groupId: String,
    accountId: String
  },
  setup (props) {
    const page = reactive({
      photo: false,
      files: [],
      degs: [],
      sending: false
    })
    const store = useStore()
    const { db, storage, functions, state } = store

    const fileToUrl = file => URL.createObjectURL(file)
    const isImageFile = name => /(\.png|\.jpg|\.jpeg|\.gif|\.bmp)/i.test(name)

    return {
      page,
      ...store,
      fileToUrl,
      isImageFile,
      rotate: index => {
        const degs = [...page.degs]
        degs[index] = ((degs[index] || 0) + 90) % 360
        page.degs = degs
      },
      upload: async () => {
        page.sending = true
        const ts = new Date()
        const messageId = ts.toISOString().replace(/[^0-9]/g, '').slice(0, 17)
        const width = state.messageThumbnailWidth
        const height = state.messageThumbnailHeight
        const quality = state.messageThumbnailQuality
        try {
          const sources = page.files.map((file, index) => ({
            file,
            path: `${process.env.NODE_ENV === 'production' ? '' : 'test/'}${props.groupId ? `groups/${props.groupId}` : `accounts/${props.accountId}`}/${messageId}_${('00' + index).slice(-3)}.v${new Date().getTime()}.${file.name.replace(/.*\./, '')}`,
            deg: page.degs[index] || 0
          })).filter(src => isImageFile(src.file.name))
          const messageRef = db.collection(props.groupId ? 'groups' : 'accounts').doc(props.groupId || props.accountId)
            .collection(props.groupId ? 'chat' : 'hotline').doc(messageId)
          const images = []
          await messageRef.set({
            sender: state.me.id,
            images,
            likes: [],
            createdAt: ts,
            updatedAt: ts
          })
          page.files = sources.map(src => src.file)
          await Promise.all(
            sources.map(async ({ file, path, deg }, index) => {
              await storage.ref().child(path).put(file)
              const result = await functions.httpsCallable('provideImage')({ path, deg, width, height, quality })
              images[index] = result.data
              page.files = page.files.filter(item => item.name !== file.name)
            })
          )
          await messageRef.update({
            images,
            updatedAt: new Date()
          })
        } finally {
          page.files = []
          page.degs = []
          page.sending = false
        }
      }
    }
  }
}
</script>
