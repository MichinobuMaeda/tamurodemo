<template>
  <div>
    <div
      v-for="item in (messages || []).slice(summary ? -3 : 0)" v-bind:key="item.id"
    >
      <v-card
        v-if="!item.deletedAt && item.message"
        outlined
        :class="item.sender === me.id ? 'ml-8' : 'mr-8'"
        :color="item.sender === me.id ? 'green lighten-5' : ''"
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
        <span v-for="(image, index) in (item.images || [])" :key="image.path">
          <v-icon
            v-if="image.deletedAt"
            color="secondary"
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
            @click="page.originalImageRotateDeg = image.deg; page.originalImage = state.images[image.path]; page.showOriginalImage = true"
          />
          <v-icon
            v-else
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
          @click="update(item, { deletedAt: new Date() })"
        >
          {{ conf.icon('Delete') }}
        </v-icon>
        <v-icon
          v-else-if="!summary && (item.sender === me.id || me.priv.manager) && item.deletedAt"
          color="primary"
          @click="update(item, { deletedAt: null })"
        >
          {{ conf.icon('Restore') }}
        </v-icon>
      </div>
    </div>
    <v-bottom-sheet v-model="page.showOriginalImage" fullscreen scrollable :retain-focus="false">
      <v-card class="pa-1">
        <v-card-title>
          <v-spacer />
          <v-btn icon @click="page.showOriginalImage = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center px-1 pb-8">
          <img
            :src="page.originalImage"
            :alt="page.originalImage"
            style="max-width: 100%"
          />
        </v-card-text>
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
  setup () {
    const page = reactive({
      showOriginalImage: false,
      originalImageUrl: null,
      originalImageRotateDeg: 0
    })
    const store = useStore()
    const { storage, withTz, state } = store

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
      pathToUrl: path => storage.ref(path).getDownloadURL()
    }
  }
}
</script>
