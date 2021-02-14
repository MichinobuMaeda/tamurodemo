<template>
  <div class="mt-2">
    <v-row v-if="edit">
      <PermittedMembers class="float-right" :id="id" />
      <v-col class="col-12">
        <LinkButton
          v-for="group in permittedGroups" :key="group.id"
          :icon="conf.icon('Group')"
          :label="group.name"
          @click="goPageGroup(group.id)"
        />
        <LinkButton
          v-for="item in permittedUsers" :key="item.id"
          :icon="conf.icon('User')"
          :label="user(item.id).name"
          @click="goPageUser(item.id)"
        />
      </v-col>
    </v-row>
    <v-divider />

    <v-row v-if="!edit">
      <v-col class="title--text col-4">
        <v-icon>{{ conf.icon(picon.a) }}</v-icon>
        {{ $t('User name') }}
      </v-col>
      <v-col class="col-8" v-if="/^ja_/.test(me.locale)">
        {{ user(id).lastName }}
        <span v-if="user(id).previousName">
          ( {{ user(id).previousName }} )
        </span>
        {{ user(id).firstName }}
        <span v-if="user(id).middleName">
          ( {{ $t('Middle name') }}: {{ user(id).middleName }} )
        </span>
      </v-col>
      <v-col class="col-8" v-else>
        {{ user(id).firstName }}
        {{ user(id).middleName }}
        {{ user(id).lastName }}
        <span v-if="user(id).previousName">
          ( {{ $t('Previous name') }}: {{ user(id).previousName }} )
        </span>
      </v-col>
    </v-row>
    <v-row
      v-else
      v-for="item in conf.locales.find(item => item.value === me.locale).names" :key="item.key"
    >
      <v-col class="title--text col-4">
        <v-icon>{{ conf.icon(picon.a) }}</v-icon>
        {{ $t(item.label) }}
      </v-col>
      <v-col class="col-8">
        <EditableItem
          :label="$t(item.label)"
          v-model="user[item.key]"
          @save="val => waitFor(() => update(user(id), { [item.key]: val }))"
          :disabled="!!state.waitProc"
        />
      </v-col>
    </v-row>
    <v-divider />

    <div v-if="edit || profile(id).desc">
      <div class="title--text my-2">
        <v-icon>{{ conf.icon(picon.a) }}</v-icon>
        {{ $t('Self‐introduction') }}
      </div>
      <v-sheet outlined class="pa-2">
        <EditableItem
          type="textarea"
          :label="$t('Self‐introduction')"
          v-model="desc"
          :editable="edit"
          :disabled="!!state.waitProc"
        />
      </v-sheet>
    </div>

    <div v-if="(edit || (profile(id).descForPermitted && (preview !== 'a'))) && (id === me.id || me.priv.manager)">
      <div class="title--text my-2">
        <v-icon>{{ conf.icon(picon.c) }}</v-icon>
        {{ $t('Message for close members') }}
      </div>
      <v-sheet outlined class="pa-2">
        <EditableItem
          type="textarea"
          :label="$t('Message for close members')"
          v-model="descForPermitted"
          :editable="edit"
          :disabled="!!state.waitProc"
        />
      </v-sheet>
    </div>

    <div v-if="(edit || (profile(id).descForManagers && (preview === 'm'))) && (id === me.id || me.priv.manager)">
      <div class="title--text my-2">
        <v-icon>{{ conf.icon(picon.m) }}</v-icon>
        {{ $t('Note for managers') }}
      </div>
      <v-sheet outlined class="pa-2">
        <EditableItem
          type="textarea"
          :label="$t('Note for managers')"
          v-model="descForManagers"
          :editable="edit"
          :disabled="!!state.waitProc"
        />
      </v-sheet>
    </div>

  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import { useStore } from '@/store'
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
  setup (props) {
    const store = useStore()
    const { waitFor, update, conf, account, user, profile, group } = store
    const page = reactive({
    })

    return {
      page,
      ...store,
      permittedGroups: computed(() => (account(props.id).permittedGroups || [])
        .map(id => group(id))
        .filter(group => !group.deletedAt)),
      permittedUsers: computed(() => (account(props.id).permittedUsers || [])
        .map(id => user(id))
        .filter(user => !user.deletedAt)),
      picon: conf.permissions.reduce((ret, cur) => ({ ...ret, [cur.value]: cur.icon }), {}),
      desc: computed({
        get: () => profile(props.id).desc,
        set: val => waitFor(() => update(profile(props.id), { desc: val }))
      }),
      descForPermitted: computed({
        get: () => profile(props.id).descForPermitted,
        set: val => waitFor(() => update(profile(props.id), { descForPermitted: val }))
      }),
      descForManagers: computed({
        get: () => profile(props.id).descForManagers,
        set: val => waitFor(() => update(profile(props.id), { descForManagers: val }))
      })
    }
  }
}
</script>
