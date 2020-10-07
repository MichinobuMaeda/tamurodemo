<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="user.id === state.me.id || state.priv.manager || state.priv.admin"
        color="primary"
        class="my-0 float-right"
        v-model="page.edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('User')"
      >
        <template v-slot:title>
          <EditableItem
            :label="$t('Display name')"
            v-model="user.name"
            @save="val => set('users', user.id, { name: val })"
            :editable="page.edit && (state.priv.manager || user.id === state.me.id)"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>
      <GroupsOfUser class="mb-2" :id="user.id" :edit="page.edit" />
      <div
        v-if="user.id === state.me.id || state.priv.manager || state.priv.admin"
      >
        <span class="float-sm-left mt-2 mr-2">{{ $t('Visible for') }}</span>
        <v-chip-group
          v-if="!page.edit"
          mandatory column
          active-class="info--text"
          v-model="page.preview"
        >
          <v-chip v-for="p in permissionList" :key="p.value">
            <v-icon>{{ p.icon }}</v-icon> {{ p.text }}
          </v-chip>
        </v-chip-group>
        <v-chip
          v-else
          v-for="p in permissionList" :key="p.value"
          outlined class="mt-2 mr-2"
        >
          <v-icon>{{ p.icon }}</v-icon> {{ p.text }}
        </v-chip>
      </div>

      <Profile :id="user.id" :edit="page.edit" :preview="preview" />

    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed, watch } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'
import GroupsOfUser from '@/views/GroupsOfUser'
import Profile from '@/views/Profile'

const { useStore, icon, permissions } = helpers

export default {
  name: 'PageUser',
  components: {
    PageTitle,
    EditableItem,
    GroupsOfUser,
    Profile
  },
  setup (props, { root }) {
    const store = useStore()
    const page = reactive({
      edit: root.$route.params.mode === 'edit',
      preview: 2
    })

    watch(
      () => root.$route.params.mode,
      mode => {
        page.edit = page.edit || mode === 'edit'
      }
    )

    return {
      user: store.state.users.find(item => item.id === root.$route.params.id),
      page,
      permissionList: permissions.map(item => ({
        icon: icon(item.icon),
        value: item.value,
        text: root.$i18n.t(item.text)
      })),
      preview: computed(() => permissions[page.preview].value),
      ...store,
      ...helpers
    }
  }
}
</script>
