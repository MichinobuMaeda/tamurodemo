<template>
  <div>
    <div
      v-for="item in (messages || []).slice(summary ? -3 : 0)" v-bind:key="item.id"
    >
      <v-card
        outlined
        :class="item.sender === me.id ? 'ml-8' : 'mr-8'"
        :color="item.sender === me.id ? 'green lighten-5' : ''"
      >
        <v-card-text class="pa-1">
          <div v-for="(line, index) in (item.message || '').split('\n')" v-bind:key="index">
            {{ line || '\u200C' }}
          </div>
        </v-card-text>
      </v-card>
      <div :class="item.sender === me.id ? 'pl-8 text-right' : 'pr-8'">
        <span class="info--text">{{ withTz(item.createdAt).format('lll') }}</span>
        {{ account(item.sender).name }}
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from '@/store'

export default {
  name: 'ChatTimeline',
  props: {
    summary: Boolean,
    messages: Array
  },
  setup () {
    const store = useStore()

    return store
  }
}
</script>
