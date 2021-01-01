<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-icon
        color="primary"
        class="float-right"
        @click="$vuetify.goTo('#footer')"
      >
        {{ icon('Go bottom') }}
      </v-icon>
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Chat')"
      >
        <template v-slot:title>{{ $t('Chat') }}</template>
      </PageTitle>

      <ChatGroupSelector
        v-model="page.id"
      />

      <div
        v-if="!state.groupChats[page.id] || !state.groupChats[page.id].length"
      >
        {{ $t('No message') }}
      </div>
      <div v-for="item in (state.groupChats[page.id] || [])" v-bind:key="item.id">
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

      <v-textarea
        dense outlined autofocus auto-grow clearable
        rows="2"
        v-model="page.message"
      >
        <template v-slot:append-outer>
          <v-icon
            :disabled="!page.message"
            :color="page.message ? 'primary' : 'secondary'"
            @click="sendMessage"
          >
            {{ icon('Send') }}
          </v-icon>
        </template>
      </v-textarea>

      <v-icon
        color="primary"
        class="float-right"
        @click="$vuetify.goTo('#header')"
      >
        {{ icon('Go top') }}
      </v-icon>
      <ChatGroupSelector
        v-if="(state.groupChats[page.id] || []).length"
        id="bottom"
        v-model="page.id"
      />
    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { findItem, sortedGroups, useStore } from '@/store'
import PageTitle from '@/components/PageTitle'
import ChatGroupSelector from '@/parts/ChatGroupSelector'

export default {
  name: 'PageChat',
  components: {
    PageTitle,
    ChatGroupSelector
  },
  setup (prop, { root }) {
    const store = useStore()
    const { db, state } = store
    const page = reactive({
      id: 'all',
      message: null
    })

    const sendMessage = async () => {
      const ts = new Date()
      const doc = ts.toISOString().replace(/[^0-9]/g, '')
      await db.collection('groups').doc(page.id)
        .collection('messages').doc(doc)
        .set({
          sender: state.me.id,
          message: page.message,
          likes: [],
          createdAt: ts,
          updatedAt: ts
        })
      page.message = null
    }

    return {
      page,
      ...store,
      sendMessage,
      userName: id => findItem(state.users, id).name || 'Unknown',
      groups: state => [
        findItem(state.groups, 'all'),
        ...sortedGroups(state).filter(group => group.members.includes(state.me.id))
      ]
    }
  }
}
</script>
