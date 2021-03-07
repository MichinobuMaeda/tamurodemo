<template>
  <div>
    <v-icon
      v-if="!summary"
      color="primary"
      @click="page.photo = true; page.files = []"
    >
      {{ conf.icon('Add photo') }}
    </v-icon>
    <v-bottom-sheet fullscreen scrollable v-model="page.photo">
      <v-card>
        <v-card-title class="py-1">
          {{ $t('multiple image files', { count: state.uploadFileCountMax }) }}
          <v-spacer />
          <v-btn icon @click="page.photo = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row class="justify-center">
            <v-col class="col-12 col-sm-8 col-md-6 col-lg-5">
              <v-file-input
                :prepend-icon="conf.icon('Add photo') "
                multiple
                v-model="page.files"
              >
                <template v-slot:append-outer>
                  <v-icon
                    :disabled="!(page.files && page.files.some(file => isImageFile(file.name)))"
                    color="primary"
                    @click="upload"
                  >
                    {{ conf.icon('Send') }}
                  </v-icon>
                </template>
              </v-file-input>
            </v-col>
          </v-row>
          <v-alert
            type="error"
            text
            v-if="page.files && page.files.length > state.uploadFileCountMax"
            class="text-center"
          >
            {{ $t('up to n files', { count: state.uploadFileCountMax }) }}
          </v-alert>
          <div
            v-else
            v-for="(file, index) in page.files" :key="index"
            class="col-12"
          >
            <v-img
              v-if="isImageFile(file.name)"
              style="display: inline-block"
              class="mr-1"
              :max-height="state.messageThumbnailSize"
              :max-width="state.messageThumbnailSize"
              :src="fileToUrl(file)"
            ></v-img>
            <v-icon v-else>{{ conf.icon('Broken image') }}</v-icon>
            {{ file.name }}
          </div>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
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
      files: []
    })
    const store = useStore()
    const { db, storage, state } = store

    const fileToUrl = file => URL.createObjectURL(file)
    const isImageFile = name => /(\.png|\.jpg|\.jpeg|\.gif|\.bmp)/i.test(name)

    return {
      page,
      ...store,
      fileToUrl,
      isImageFile,
      upload: async () => {
        const ts = new Date()
        const messageId = ts.toISOString().replace(/[^0-9]/g, '').slice(0, 17)
        const files = page.files.filter(file => isImageFile(file.name))
        const images = await Promise.all(
          files.filter(file => isImageFile(file.name)).map(async (file, index) => {
            const path = `${process.env.NODE_ENV === 'production' ? '' : 'test/'}${props.groupId ? 'groups' : 'accounts'}/${props.groupId}/${messageId}_${('00' + index).slice(-3)}_${state.me.id}.${file.name.replace(/.*\./, '')}`
            const ref = storage.ref().child(path)
            await ref.put(file)
            return path
          })
        )
        page.photo = false
        page.files = []
        await db.collection(props.groupId ? 'groups' : 'accounts').doc(props.groupId || props.accountId)
          .collection(props.groupId ? 'chat' : 'hotline').doc(messageId)
          .set({
            sender: state.me.id,
            images,
            likes: [],
            createdAt: ts,
            updatedAt: ts
          })
      }
    }
  }
}
</script>
