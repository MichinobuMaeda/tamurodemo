<template>
  <div>
    <div
      v-for="item in (messages || []).slice(summary ? -3 : 0)" v-bind:key="item.id"
    >
      <v-card
        v-if="!item.deletedAt && item.message"
        outlined
        :class="item.sender === me.id ? 'ml-8' : 'mr-8'"
        :color="item.sender === me.id ? 'mymessage' : ''"
      >
        <v-card-text class="pa-1">
          <div v-for="(line, index) in formatMessage(item.message || '', summary)" v-bind:key="index">
            {{ line }}
          </div>
        </v-card-text>
      </v-card>
      <div
        v-else-if="!item.deletedAt && item.images"
        :class="item.sender === me.id ? 'text-right' : ''"
      >
        <span v-for="(image, index) in (item.images || []).filter(image => !image.deletedAt || (!summary && (item.sender === me.id || me.priv.manager)))" :key="image.path">
          <v-icon
            v-if="image.deletedAt"
            color="secondary"
            @click="showOriginalImage(index, item)"
          >
            {{ conf.icon('Broken image') }}
          </v-icon>
          <v-img
            v-else-if="image.tn && state.images[image.tn] && (!summary || index < state.messageSummaryThumbnailCount)"
            style="display: inline-block;"
            class="mt-1 mr-1"
            :max-height="state.messageThumbnailHeight / (summary ? 2 : 1)"
            :max-width="state.messageThumbnailWidth / (summary ? 2 : 1)"
            contain
            :src="state.images[image.tn]"
            :alt="image.path"
            @click="showOriginalImage(index, item)"
          />
          <v-icon
            v-else
            class="my-1"
            color="info"
          >
            {{ conf.icon('Photo') }}
          </v-icon>
        </span>
      </div>
      <div
        v-else
        :class="item.sender === me.id ? 'text-right deleted--text' : 'deleted--text'"
      >
        {{ $t('Deleted') }}
      </div>
      <div :class="item.sender === me.id ? 'text-right' : ''">
        <span
          :class="item.deletedAt ? 'deleted--text' : 'info--text'"
        >
          {{ formatTimestamp(item.createdAt) }}
        </span>
        <span
          :class="item.deletedAt ? 'deleted--text' : ''"
        >
          {{ account(item.sender).name }}
        </span>
        <v-icon
          v-if="!summary && (item.sender === me.id || me.priv.manager) && !item.deletedAt"
          color="primary"
          @click="remove(item)"
        >
          {{ conf.icon('Delete') }}
        </v-icon>
        <v-icon
          v-else-if="!summary && (item.sender === me.id || me.priv.manager) && item.deletedAt"
          color="primary"
          @click="restore(item)"
        >
          {{ conf.icon('Restore') }}
        </v-icon>
      </div>
    </div>
    <v-bottom-sheet v-model="page.showOriginalImage" fullscreen scrollable :retain-focus="false">
      <v-card class="pa-1" v-if="page.originalImageData">
        <v-card-title>
          <span class="info--text mr-1">
            {{ formatTimestamp(page.originalImageData.createdAt) }}
          </span>
          <span>
            {{ account(page.originalImageData.sender).name }}
          </span>
          <v-spacer />
          <v-btn icon @click="page.showOriginalImage = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center">
          <img
            :src="state.images[page.originalImageData.images[page.originalImageIndex].path]"
            :alt="page.originalImageData.images[page.originalImageIndex].path"
            :style="`max-width: 100%; filter: brightness(${ page.originalImageData.images[page.originalImageIndex].deletedAt ? '33%' : '100%' });`"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-progress-circular
            v-if="page.rotateing"
            indeterminate
            color="info"
            class="mx-2"
          />
          <v-btn
            v-if="page.originalImageData.sender === me.id && me.priv.admin"
            icon
            color="primary"
            @click="rotateImage"
            :disabled="page.rotateing"
          >
            <v-icon>{{ conf.icon('Rotate image') }}</v-icon>
          </v-btn>
          <v-btn
            v-if="!page.originalImageData.images[page.originalImageIndex].deletedAt"
            icon
            color="primary"
            @click="removeImage"
            :disabled="page.rotateing"
          >
            <v-icon>{{ conf.icon('Delete') }}</v-icon>
          </v-btn>
          <v-btn
            v-else
            icon
            color="primary"
            @click="restoreImage"
            :disabled="page.rotateing"
          >
            <v-icon>{{ conf.icon('Restore') }}</v-icon>
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import { useStore } from '@/store'
import { reactive } from '@vue/composition-api'

export default {
  name: 'ChatTimeline',
  props: {
    summary: Boolean,
    messages: Array
  },
  setup (props) {
    const page = reactive({
      showOriginalImage: false,
      originalImageIndex: null,
      originalImageData: null,
      rotateing: false
    })
    const store = useStore()
    const { storage, functions, withTz, state, update } = store

    return {
      page,
      ...store,
      formatMessage: (msg, summary) => {
        const lines = (
          (summary && msg && msg.length > state.messageSummaryLength)
            ? `${msg.slice(0, state.messageSummaryLength - 4)} ...`
            : (msg || '')
        ).split('\n').map(line => line || '\u200C')
        return (summary && lines.length > state.messageSummaryLines)
          ? [...lines.slice(0, state.messageSummaryLines - 1), '...']
          : lines
      },
      formatTimestamp: ts => withTz(ts).format(
        new Date().getTime() - ts.getTime() > state.messageShortenTimestampThreshold
          ? 'lll'
          : 'h:mm'
      ),
      pathToUrl: path => storage.ref(path).getDownloadURL(),
      showOriginalImage: (index, item) => {
        if (!props.summary) {
          page.originalImageIndex = index
          page.originalImageData = item
          page.showOriginalImage = true
        }
      },
      rotateImage: async () => {
        page.rotateing = true
        const width = state.messageThumbnailWidth
        const height = state.messageThumbnailHeight
        const quality = state.messageThumbnailQuality
        const item = page.originalImageData
        const index = page.originalImageIndex
        try {
          const result = await functions.httpsCallable('provideImage')({
            path: item.images[index].path,
            deg: 90,
            width,
            height,
            quality
          })
          const images = item.images
          images[index] = result.data
          await update(item, { images })
        } finally {
          // page.showOriginalImage = false
          page.rotateing = false
        }
      },
      removeImage: async () => {
        const item = page.originalImageData
        const index = page.originalImageIndex
        const images = item.images
        images[index].deletedAt = new Date()
        await update(item, { images })
      },
      restoreImage: async () => {
        const item = page.originalImageData
        const index = page.originalImageIndex
        const images = item.images
        images[index].deletedAt = null
        await update(item, { images })
      }
    }
  }
}
</script>
