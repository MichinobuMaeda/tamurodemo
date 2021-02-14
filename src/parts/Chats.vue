<template>
  <v-expansion-panels
    v-model="expand"
  >
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div>
          <v-icon>{{ conf.icon(accountId ? 'Contact the administrator' : 'Chat') }}</v-icon>
          {{ $t(summary ? 'Recent messages' : (accountId ? 'Contact the administrator' : 'Chat')) }}
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content
        class="overflow-y-auto"
        id="chat-scroll-target"
        :style="'max-height: ' + height"
      >
        <div v-if="!groupId">
          <div
            v-for="item in (accountId ? [account(accountId)] : state.accounts)" :key="item.id"
          >
            <LinkButton
              v-if="summary && (state.hotlines[item.id] || []).length"
              :icon="conf.icon((item.id === me.id) ? 'Contact the administrator' : 'User')"
              :label="(item.id === me.id) ? $t('Contact the administrator') : account(item.id).name"
              @click="goPageUser(item.id)"
            />
            <div v-else-if="!summary && !(state.hotlines[item.id] || []).length">
              {{ $t('No message') }}
            </div>
            <ChatTimeline
              v-if="(state.hotlines[item.id] || []).length"
              :summary="summary"
              :messages="state.hotlines[item.id] || []"
            />
          </div>
        </div>

        <div v-if="!accountId">
          <div
            v-for="item in (groupId ? [group(groupId)] : me.groups)" :key="item.id"
          >
            <LinkButton
              v-if="summary"
              :icon="conf.icon('Group')"
              :label="item.name"
              @click="goPageGroup(item.id)"
            />
            <div v-else-if="!(state.groupChats[item.id] || []).length">
              {{ $t('No message') }}
            </div>
            <ChatTimeline
              :summary="summary"
              :messages="state.groupChats[item.id] || []"
            />
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
              {{ conf.icon('Send') }}
            </v-icon>
          </template>
        </v-textarea>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { useStore, postGroupChat, postHotline } from '@/store'
import { ref, computed } from '@vue/composition-api'
import LinkButton from '../components/LinkButton'
import ChatTimeline from './ChatTimeline'

export default {
  name: 'Chats',
  components: {
    LinkButton,
    ChatTimeline
  },
  props: {
    groupId: String,
    accountId: String,
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
      if (props.groupId) {
        await postGroupChat(store, props.groupId, message.value)
      } else if (props.accountId) {
        await postHotline(store, props.accountId, message.value)
      }
      message.value = null
    }

    return {
      message,
      ...store,
      expand: computed({
        get: () => state.me.chatSummaryExpand ? 0 : undefined,
        set: v => update(state.me, { chatSummaryExpand: v === 0 })
      }),
      summary: computed(() => !(props.groupId || props.accountId)),
      postMessage
    }
  }
}
</script>
