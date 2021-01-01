<template>
  <v-card outlined>
    <v-card-title
      class="py-2"
    >
      <v-icon class="mr-1">{{ icon('Chat') }}</v-icon>
      {{ $t('Recent messages') }}
      <v-spacer />
      <v-icon
        @click="toggleChatSummaryExpand"
      >
        {{ icon(state.me.chatSummaryExpand ? 'Shrink' : 'Expand') }}
      </v-icon>
    </v-card-title>
    <v-card-text
      v-if="state.me.chatSummaryExpand"
      class="pa-2"
    >
      <ChatGroupSelector
        v-if="!id"
        v-model="page.id"
      />

      <div v-if="!state.groupChats[page.id] || !state.groupChats[page.id].length">{{ $t('No message') }}</div>
      <div v-for="item in (state.groupChats[page.id] || []).slice(-3)" v-bind:key="item.id">
        <v-card
          outlined
          :class="item.sender === state.me.id ? 'ml-8' : 'mr-8'"
          :color="item.sender === state.me.id ? 'green lighten-5' : ''"
        >
          <v-card-text class="pa-1">
            <div v-for="(line, index) in (item.message || '').split('\n')" v-bind:key="index">
              {{ line || '\u200C' }}
            </div>
          </v-card-text>
        </v-card>
        <div :class="item.sender === state.me.id ? 'pl-8 text-right' : 'pr-8'">
          <span class="info--text">{{ withTz(item.createdAt).format('lll') }}</span>
          {{ userName(item.sender) }}
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useStore, findItem, sortedGroups } from '@/store'
import ChatGroupSelector from '@/parts/ChatGroupSelector'

export default {
  name: 'ChatSummary',
  components: {
    ChatGroupSelector
  },
  props: {
    id: String
  },
  setup (props, { root }) {
    const store = useStore()
    const { state, update } = store
    const page = reactive({
      id: props.id || 'all',
      unsubscriber: null
    })

    const toggleChatSummaryExpand = () => update('accounts', state.me.id, {
      chatSummaryExpand: !state.me.chatSummaryExpand
    })

    return {
      page,
      ...store,
      userName: id => findItem(state.users, id).name || 'Unknown',
      groups: state => [
        findItem(state.groups, 'all'),
        ...sortedGroups(state).filter(group => group.members.includes(state.me.id))
      ],
      toggleChatSummaryExpand
    }
  }
}
</script>
