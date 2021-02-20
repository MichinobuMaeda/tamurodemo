<template>
  <div class="mt-2">
    <v-row v-if="edit">
      <v-col class="col-12">
        <PermittedMembers :id="id" />
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

    <v-divider class="my-4" />

    <v-row v-if="!edit">
      <v-col class="title--text col-4">
        <v-icon>{{ conf.icon(picon.a) }}</v-icon>
        {{ $t('User name') }}
      </v-col>
      <v-col class="col-8" v-if="/^ja_/.test(me.locale)">
        {{ profile(id).lastName }}
        <span v-if="profile(id).previousName">
          ( {{ profile(id).previousName }} )
        </span>
        {{ profile(id).firstName }}
      </v-col>
      <v-col class="col-8" v-else>
        {{ profile(id).lastName }},
        {{ profile(id).firstName }}
        <span v-if="profile(id).previousName">
          ( {{ $t('Previous name') }}: {{ profile(id).previousName }} )
        </span>
      </v-col>
      <v-col class="title--text col-4" v-if="profile(id).fullName">
        <v-icon>{{ conf.icon(picon.a) }}</v-icon>
        {{ 'Full name' }}
      </v-col>
      <v-col class="col-8" v-if="profile(id).fullName">
        {{ profile(id).fullName }}
      </v-col>
    </v-row>
    <v-row
      v-else
      v-for="item in conf.locales.find(item => item.value === me.locale).nameItems" :key="item.key"
    >
      <v-col class="title--text col-4">
        <v-icon>{{ conf.icon(picon.a) }}</v-icon>
        {{ item.label }}
      </v-col>
      <v-col class="col-8">
        <EditableItem
          :label="item.label"
          :placeholder="item.placeholder"
          v-model="profile(id)[item.key]"
          @save="val => setProfile(item.key, val, 'a')"
          :disabled="!!state.waitProc"
        />
      </v-col>
    </v-row>

    <v-row v-if="edit || profile(id).desc">
      <v-col class="col-12">
        <div class="title--text mb-2">
          <v-icon>{{ conf.icon(picon.a) }}</v-icon>
          {{ $t('Self‐introduction') }}
        </div>
        <v-sheet outlined class="pa-2">
          <EditableItem
            type="textarea"
            :label="$t('Self‐introduction')"
            v-model="profile(id).desc"
            @save="val => setProfile('desc', val, 'a')"
            :editable="edit"
            :disabled="!!state.waitProc"
          />
        </v-sheet>
      </v-col>
    </v-row>

    <v-row v-if="(edit || (profile(id).descForPermitted && (preview !== 'a'))) && (id === me.id || me.priv.manager)">
      <v-col class="col-12">
        <div class="title--text mb-2">
          <v-icon>{{ conf.icon(picon.c) }}</v-icon>
          {{ $t('Message for close members') }}
        </div>
        <v-sheet outlined class="pa-2">
          <EditableItem
            type="textarea"
            :label="$t('Message for close members')"
            v-model="profile(id).descForPermitted"
            @save="val => setProfile('descForPermitted', val, 'c')"
            :editable="edit"
            :disabled="!!state.waitProc"
          />
        </v-sheet>
      </v-col>
    </v-row>

    <v-row v-if="(edit || (profile(id).descForManagers && (preview === 'm'))) && (id === me.id || me.priv.manager)">
      <v-col class="col-12">
        <div class="title--text mb-2">
          <v-icon>{{ conf.icon(picon.m) }}</v-icon>
          {{ $t('Note for managers') }}
        </div>
        <v-sheet outlined class="pa-2">
          <EditableItem
            type="textarea"
            :label="$t('Note for managers')"
            v-model="profile(id).descForManagers"
            @save="val => setProfile('descForManagers', val, 'm')"
            :editable="edit"
            :disabled="!!state.waitProc"
          />
        </v-sheet>
      </v-col>
    </v-row>

    <v-card
      v-if="edit || socialItems.some(item => profile(id)[item.key])"
      class="my-4"
    >
      <v-card-title class="h3--text">
        {{ $t('Social media') }}
      </v-card-title>
      <v-card-text>
        <v-row v-for="item in socialItems" :key="item.key">
          <v-col class="title--text col-4" v-if="edit || profile(id)[item.key]">
            <v-icon
              v-if="edit"
              class="primary--text"
              @click="switchPermission(item.key)"
            >
              {{ conf.icon(picon[profile(id)[`${item.key}_p`]] || picon.m) }}
            </v-icon>
            <v-icon
              v-else
            >
              {{ conf.icon(picon[profile(id)[`${item.key}_p`]] || picon.m) }}
            </v-icon>
            {{ item.label }}
          </v-col>
          <v-col class="col-8" v-if="edit || profile(id)[item.key]">
            <EditableItem
              :label="item.label"
              :placeholder="item.placeholder"
              v-model="profile(id)[item.key]"
              @save="val => setProfile(item.key, val)"
              :editable="edit"
              :disabled="!!state.waitProc"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div v-for="prefix in addressIndexes" :key="prefix">
      <v-card
        v-if="edit || contactItems(prefix).some(item => profile(id)[item.key])"
        class="my-4"
      >
        <v-card-title class="h3--text">
          {{ $t('Contact') }} {{ prefix.slice(3) }}
        </v-card-title>
        <v-card-text>
          <v-row v-for="item in contactItems(prefix)" :key="item.key">
            <v-col class="title--text col-4" v-if="edit || profile(id)[item.key]">
              <v-icon
                v-if="edit"
                class="primary--text"
                @click="switchPermission(item.key)"
              >
                {{ conf.icon(picon[profile(id)[`${item.key}_p`]] || picon.m) }}
              </v-icon>
              <v-icon
                v-else
              >
                {{ conf.icon(picon[profile(id)[`${item.key}_p`]] || picon.m) }}
              </v-icon>
              {{ item.label }}
            </v-col>
            <v-col class="col-8" v-if="edit || profile(id)[item.key]">
              <EditableItem
                :label="item.label"
                :placeholder="item.placeholder"
                v-model="profile(id)[item.key]"
                @save="val => setProfile(item.key, val)"
                :editable="edit"
                :disabled="!!state.waitProc"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
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
    const { state, waitFor, update, conf, account, user, profile, group } = store

    const picon = conf.permissions.reduce((ret, cur) => ({ ...ret, [cur.value]: cur.icon }), {})

    return {
      ...store,
      addressIndexes: computed(() => [...Array(state.service.conf.profileAddressCount || 1).keys()].map(key => `add${key + 1}`)),
      socialItems: computed(() => conf.locales.find(item => item.value === state.me.locale).socialItems.filter(item => props.edit || props.preview === 'm' || (props.preview === 'c' && ['a', 'c'].includes(profile(props.id)[`${item.key}_p`])) || (props.preview === 'a' && profile(props.id)[`${item.key}_p`] === 'a'))),
      contactItems: prefix => conf.locales.find(item => item.value === state.me.locale).addressItems.map(item => ({ ...item, key: `${prefix}_${item.key}` })).filter(item => props.edit || props.preview === 'm' || (props.preview === 'c' && ['a', 'c'].includes(profile(props.id)[`${item.key}_p`])) || (props.preview === 'a' && profile(props.id)[`${item.key}_p`] === 'a')),
      permittedGroups: computed(() => (profile(props.id).permittedGroups || [])
        .map(id => group(id))
        .filter(group => !group.deletedAt)),
      permittedUsers: computed(() => (profile(props.id).permittedUsers || [])
        .filter(id => !account(id).deletedAt)
        .map(id => user(id))),
      picon,
      setProfile: (key, val, p) => waitFor(async () => {
        const ts = new Date()
        await update(user(props.id), {}, ts)
        await update(profile(props.id), { [key]: val, [`${key}_p`]: p || profile(props.id)[`${key}_p`] || 'm' }, ts)
      }),
      switchPermission: async key => {
        const ts = new Date()
        await update(user(props.id), {}, ts)
        await update(profile(props.id), {
          [`${key}_p`]: profile(props.id)[`${key}_p`] === 'c'
            ? 'a'
            : profile(props.id)[`${key}_p`] === 'a'
              ? 'm'
              : 'c'
        }, ts)
      }
    }
  }
}
</script>
