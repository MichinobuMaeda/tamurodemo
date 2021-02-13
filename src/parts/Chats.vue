<template>
  <v-expansion-panels
    v-model="expand"
  >
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div>
          <v-icon>{{ icon(account ? 'Contact the administrator' : 'Chat') }}</v-icon>
          {{ $t(summary ? 'Recent messages' : (account ? 'Contact the administrator' : 'Chat')) }}
        </div>
      </v-expansion-panel-header>
      <v-expansion-panel-content
        class="overflow-y-auto"
        id="chat-scroll-target"
        :style="'max-height: ' + height"
      >
        <div v-if="!group">
          <div
            v-for="account in accounts" :key="account.id"
          >
            <LinkButton
              v-if="summary && (state.hotlines[account.id] || []).length"
              :icon="icon('User')"
              :label="nameOf(account.id)"
              @click="goPageUser(account.id)"
            />
            <div v-else-if="!summary && !(state.hotlines[account.id] || []).length">
              {{ $t('No message') }}
            </div>
            <ChatTimeline
              v-if="(state.hotlines[account.id] || []).length"
              :summary="summary"
              :messages="state.hotlines[account.id] || []"
            />
          </div>
        </div>

        <div v-if="!account">
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
            <ChatTimeline
              :summary="summary"
              :messages="state.groupChats[group.id] || []"
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
import LinkButton from '../components/LinkButton'
import ChatTimeline from './ChatTimeline'
import { postGroupChat, postHotline } from '../store/messaging'

export default {
  name: 'Chats',
  components: {
    LinkButton,
    ChatTimeline
  },
  props: {
    group: String,
    account: String,
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
      if (props.group) {
        await postGroupChat(store, props.group, message.value)
      } else if (props.account) {
        await postHotline(store, props.account, message.value)
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
      summary: computed(() => !(props.group || props.account)),
      groups: computed(() => props.group ? [findItem(state.groups, props.group)] : groupsOfMe(state)),
      accounts: computed(() => props.account ? [findItem(state.accounts, props.account)] : state.accounts),
      postMessage
    }
  }
}
</script>
