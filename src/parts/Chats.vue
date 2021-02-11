<template>
  <v-expansion-panels
    v-model="expand"
  >
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div>
          <v-icon>{{ icon('Chat') }}</v-icon>
          {{ $t(summary ? 'Recent messages' : 'Chat') }}
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content
        class="overflow-y-auto"
        id="chat-scroll-target"
        :style="'max-height: ' + height"
      >
        <div
          v-for="group in groups" :key="group.id"
        >
          <LinkButton
            v-if="summary"
            :icon="icon('Group')"
            :label="group.name"
            @click="goPageGroup(group.id)"
          />
          <div v-else-if="!(state.groupChats[group.id] || []).length">
            {{ $t('No message') }}
          </div>
          <div
            v-for="item in (state.groupChats[group.id] || []).slice(summary ? -3 : 0)" v-bind:key="item.id"
          >
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
        </div>

        <v-textarea
          v-if="!summary"
          dense outlined autofocus auto-grow clearable
          rows="2"
          v-model="message"
        >
          <template v-slot:append-outer>
            <v-icon
              :disabled="!message"
              :color="message ? 'primary' : 'secondary'"
              @click="postMessage"
            >
              {{ icon('Send') }}
            </v-icon>
          </template>
        </v-textarea>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { useStore, findItem, groupsOfMe } from '@/store'
import { ref, computed } from '@vue/composition-api'
import LinkButton from '@/components/LinkButton'
import { postGroupChat } from '../store/messaging'

export default {
  name: 'Chats',
  components: {
    LinkButton
  },
  props: {
    group: String,
    height: {
      type: String,
      default: '240px'
    }
  },
  setup (props) {
    const store = useStore()
    const { state, update } = store

    const message = ref(null)

    const postMessage = async () => {
      await postGroupChat(store, props.group, message.value)
      message.value = null
    }

    return {
      message,
      ...store,
      expand: computed({
        get: () => state.me.chatSummaryExpand ? 0 : undefined,
        set: v => update(state.me, { chatSummaryExpand: v === 0 })
      }),
      summary: !props.group,
      groups: computed(() => props.group ? [findItem(state.groups, props.group)] : groupsOfMe(state)),
      userName: id => findItem(state.users, id).name || 'Unknown',
      postMessage
    }
  }
}
</script>
