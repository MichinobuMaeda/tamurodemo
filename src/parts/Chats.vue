<template>
  <v-expansion-panels
    v-model="expand"
  >
    <v-expansion-panel>
      <v-expansion-panel-header>
        <div>
          <v-icon>{{ conf.icon(accountId ? 'Contact the supervisor' : 'Chat') }}</v-icon>
          {{ $t(summary ? 'Recent messages' : (accountId ? 'Contact the supervisor' : 'Chat'), { supervisor: group('managers').name }) }}
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
              class="px-0"
              :icon="conf.icon((item.id === me.id) ? 'Contact the supervisor' : 'User')"
              :label="(item.id === me.id) ? $t('Contact the supervisor', { supervisor: group('managers').name }) : account(item.id).name"
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
              class="px-0"
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

        <ImageUploader
          v-if="!summary"
          :groupId="groupId"
          :accountId="accountId"
        />
        <v-textarea
          v-if="!summary"
          class="mb-0"
          dense outlined autofocus auto-grow clearable
          rows="2"
          v-model="page.message"
        >
          <template v-slot:append-outer>
            <v-icon
              :disabled="!page.message"
              :color="page.message ? 'primary' : 'secondary'"
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

<style scoped>
.clear { clear: both; }
</style>

<script>
import { useStore, postGroupChat, postHotline } from '@/store'
import { reactive, computed } from '@vue/composition-api'
import LinkButton from '../components/LinkButton'
import ChatTimeline from './ChatTimeline'
import ImageUploader from './ImageUploader'

export default {
  name: 'Chats',
  components: {
    LinkButton,
    ChatTimeline,
    ImageUploader
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
    const page = reactive({
      message: null
    })
    const store = useStore()
    const { state, update } = store

    const postMessage = async () => {
      if (props.groupId) {
        await postGroupChat(store, props.groupId, page.message)
      } else if (props.accountId) {
        await postHotline(store, props.accountId, page.message)
      }
      page.message = null
    }

    return {
      page,
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
