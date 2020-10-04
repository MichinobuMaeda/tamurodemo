<template>
  <div>
    <DefaultButton
      color="primary"
      :icon="icon('For permitted')"
      :label="$t('Close members')"
      @click="page.dialog = true"
    />
    <v-dialog
      max-width="640px"
      v-model="page.dialog"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon class="mr-2">{{ icon('For permitted') }}</v-icon>
          {{ $t('Close members') }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="page.dialog = false"
          >
            {{ icon('Cancel') }}
          </v-icon>
        </v-card-title>

        <v-card-text>
            <div v-for="group in page.groups" :key="group.id">
              <v-checkbox
                v-model="group.checked"
              >
                <template v-slot:label>
                  <v-icon class="float-left">{{ icon('Group') }}</v-icon>
                  {{ group.name }}
                </template>
              </v-checkbox>
              <div class="pl-8" v-if="!group.checked">
                <v-checkbox
                  v-for="user in page.users.filter(user => (group.members || []).includes(user.id))" :key="user.id"
                  v-model="user.checked"
                  :disabled="user.id === id"
                >
                  <template v-slot:label>
                    <v-icon class="float-left">{{ icon('User') }}</v-icon>
                    {{ user.name }}
                  </template>
                </v-checkbox>
              </div>
            </div>
        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <DefaultButton
            color="secondary"
            class="mr-2"
            :icon="icon('Cancel')"
            :label="$t('Cancel')"
            @click="page.dialog = false"
          />
          <DefaultButton
            color="primary"
            :icon="icon('OK')"
            :label="$t('Save')"
            :disabled="!!state.waitProc"
            @click="onSave"
          />
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
import DefaultButton from '@/components/DefaultButton'

const { useStore, getById } = helpers

export default {
  name: 'PermittedMembers',
  components: {
    DefaultButton
  },
  props: {
    id: String
  },
  setup (props, { root }) {
    const store = useStore()
    const { set } = store
    const page = reactive({
      dialog: false,
      groups: store.state.sortedGroups
        .filter(group => group.id !== 'managers')
        .map(group => ({
          ...group,
          checked: (getById(store.state.users, props.id).permittedGroups || []).includes(group.id)
        })),
      users: store.state.users
        .map(user => ({
          ...user,
          checked: user.id !== props.id && (getById(store.state.users, props.id).permittedUsers || []).includes(user.id)
        }))
    })

    const onSave = async () => {
      await set('users', props.id, {
        permittedGroups: page.groups.filter(group => group.checked).map(group => group.id),
        permittedUsers: page.users.filter(user => user.checked).map(user => user.id)
      })
      page.dialog = false
    }

    return {
      ...store,
      page,
      onSave,
      ...helpers
    }
  }
}
</script>
