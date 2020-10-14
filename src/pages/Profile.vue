<template>
  <div class="mt-2">
    <v-row v-if="edit">
      <PermittedMembers class="float-right" :id="user.id" />
      <v-col class="col-12">
        <LinkButton
          v-for="group in (user.permittedGroups || []).map(id => getById(state.groups, id)).filter(group => !group.deletedAt)" :key="group.id"
          :icon="icon('Group')"
          :label="group.name"
          @click="goPage($router, { name: 'group', params: { id: group.id } })"
        />
        <LinkButton
          v-for="user in (user.permittedUsers || []).map(id => getById(state.users, id)).filter(user => !user.deletedAt)" :key="user.id"
          :icon="icon('User')"
          :label="user.name"
          @click="goPage($router, { name: 'user', params: { id: user.id } })"
        />
      </v-col>
    </v-row>
    <v-divider />

    <v-row v-if="!edit">
      <v-col class="title--text col-4">
        <v-icon>{{ picon.a }}</v-icon>
        {{ $t('User name') }}
      </v-col>
      <v-col class="col-8" v-if="/^ja_/.test(state.me.locale)">
        {{ user.lastName }}
        <span v-if="user.previousName">
          ( {{ user.previousName }} )
        </span>
        {{ user.firstName }}
        <span v-if="user.middleName">
          ( {{ $t('Middle name') }}: {{ user.middleName }} )
        </span>
      </v-col>
      <v-col class="col-8" v-else>
        {{ user.firstName }}
        {{ user.middleName }}
        {{ user.lastName }}
        <span v-if="user.previousName">
          ( {{ $t('Previous name') }}: {{ user.previousName }} )
        </span>
      </v-col>
    </v-row>
    <v-row
      v-else
      v-for="item in (/^ja_/.test(state.me.locale) ? nameOrderJa :nameOrderEn )" :key="item.key"
    >
      <v-col class="title--text col-4">
        <v-icon>{{ picon.a }}</v-icon>
        {{ $t(item.label) }}
      </v-col>
      <v-col class="col-8">
        <EditableItem
          :label="$t(item.label)"
          v-model="user[item.key]"
          @save="val => set('users', user.id, { [item.key]: val })"
          :disabled="!!state.waitProc"
        />
      </v-col>
    </v-row>
    <v-divider />

    <div v-if="edit || user.desc">
      <div class="title--text my-2">
        <v-icon>{{ picon.a }}</v-icon>
        {{ $t('Self‐introduction') }}
      </div>
      <v-sheet outlined class="pa-2">
        <EditableItem
          type="textarea"
          :label="$t('Self‐introduction')"
          v-model="user.desc"
          @save="val => set('users', user.id, { desc: val })"
          :editable="edit"
          :disabled="!!state.waitProc"
        />
      </v-sheet>
    </div>

    <div v-if="(edit || (user.descForPermitted && (preview !== 'a'))) && (user.id === state.me.id || priv.manager)">
      <div class="title--text my-2">
        <v-icon>{{ picon.c }}</v-icon>
        {{ $t('Message for close members') }}
      </div>
      <v-sheet outlined class="pa-2">
        <EditableItem
          type="textarea"
          :label="$t('Message for close members')"
          v-model="user.descForPermitted"
          @save="val => set('users', user.id, { descForPermitted: val })"
          :editable="edit"
          :disabled="!!state.waitProc"
        />
      </v-sheet>
    </div>

    <div v-if="(edit || (user.descForManagers && (preview === 'm'))) && (user.id === state.me.id || priv.manager)">
      <div class="title--text my-2">
        <v-icon>{{ picon.m }}</v-icon>
        {{ $t('Note for managers') }}
      </div>
      <v-sheet outlined class="pa-2">
        <EditableItem
          type="textarea"
          :label="$t('Note for managers')"
          v-model="user.descForManagers"
          @save="val => set('users', user.id, { descForManagers: val })"
          :editable="edit"
          :disabled="!!state.waitProc"
        />
      </v-sheet>
    </div>

  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { useStore, icon } from '@/helpers'
import { permissions } from '@/conf/permissions'
import EditableItem from '@/components/EditableItem'
import LinkButton from '@/components/LinkButton'
import PermittedMembers from '@/parts/PermittedMembers'

export default {
  name: 'Profile',
  components: {
    LinkButton,
    EditableItem,
    PermittedMembers
  },
  props: {
    id: String,
    edit: {
      type: Boolean,
      default: false
    },
    preview: {
      type: String,
      default: 'm'
    }
  },
  setup (props, { root }) {
    const store = useStore()
    const page = reactive({
    })

    return {
      page,
      ...store,
      account: computed(() => store.state.accounts.find(item => item.id === props.id)),
      user: computed(() => store.state.users.find(item => item.id === props.id)),
      profile: computed(() => store.state.profiles.find(item => item.id === props.id)),
      rulesName: [
        v => !!v || root.$i18n.t('Required')
      ],
      nameOrderJa: [
        { label: 'Last name', key: 'lastName' },
        { label: 'First name', key: 'firstName' },
        { label: 'Previous name', key: 'previousName' },
        { label: 'Middle name', key: 'middleName' }
      ],
      nameOrderEn: [
        { label: 'First name', key: 'firstName' },
        { label: 'Middle name', key: 'middleName' },
        { label: 'Last name', key: 'lastName' },
        { label: 'Previous name', key: 'previousName' }
      ],
      permissionList: permissions.map(item => ({
        icon: icon(item.icon),
        value: item.value,
        text: root.$i18n.t(item.text)
      })),
      picon: permissions.reduce((ret, cur) => ({ ...ret, [cur.value]: icon(cur.icon) }), {}),
      ...helpers
    }
  }
}
</script>
