<template>
  <div>
    <div
      v-for="item in (messages || []).slice(summary ? -3 : 0)" v-bind:key="item.id"
    >
      <v-card
        v-if="!item.deletedAt"
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
      <div
        v-else
        :class="item.sender === me.id ? 'text-right deleted--text' : 'deleted--text'"
      >
        {{ $t('Deleted') }}
      </div>
      <div :class="item.sender === me.id ? 'pl-8 text-right' : 'pr-8'">
        <span
          :class="item.deletedAt ? 'deleted--text' : 'info--text'"
        >
          {{ withTz(item.createdAt).format(new Date().getTime() - item.createdAt.getTime() > 20 * 3600 * 1000 ? 'lll' : 'h:mm') }}
        </span>
        <span
          :class="item.deletedAt ? 'deleted--text' : ''"
        >
          {{ account(item.sender).name }}
        </span>
        <v-icon
          v-if="(item.sender === me.id || me.priv.manager) && !item.deletedAt"
          color="primary"
          @click="update(item, { deletedAt: new Date() })"
        >
          {{ conf.icon('Delete') }}
        </v-icon>
        <v-icon
          v-else-if="(item.sender === me.id || me.priv.manager) && item.deletedAt"
          color="primary"
          @click="update(item, { deletedAt: null })"
        >
          {{ conf.icon('Restore') }}
        </v-icon>
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
