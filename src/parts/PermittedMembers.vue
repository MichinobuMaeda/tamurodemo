<template>
  <div>
    <DefaultButton
      color="primary"
      :icon="conf.icon('For permitted')"
      :label="$t('Close members')"
      @click="onEdit(groups, users)"
    />
    <v-dialog
      max-width="640px"
      v-model="page.dialog"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon class="mr-2">{{ conf.icon('For permitted') }}</v-icon>
          {{ $t('Close members') }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="page.dialog = false"
          >
            {{ conf.icon('Cancel') }}
          </v-icon>
        </v-card-title>

        <v-card-text class="pa-1">
          <v-expansion-panels>
            <v-expansion-panel
              v-for="group in page.groups" :key="group.id"
            >
              <v-expansion-panel-header class="py-0">
                <v-flex shrink>
                  <v-checkbox
                    v-model="group.checked"
                    dense
                    @click.native="e => { e.cancelBubble = true }"
                  >
                    <template v-slot:label>
                      <v-icon class="float-left">{{ conf.icon('Group') }}</v-icon>
                      {{ group.name }}
                    </template>
                  </v-checkbox>
                </v-flex>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="pl-6 py-0">
                <div
                  v-for="user in page.users.filter(user => (group.members || []).includes(user.id))" :key="user.id"
                >
                  <v-checkbox
                    v-if="user.id === id || group.checked"
                    dense
                    v-model="page.checked"
                    :disabled="true"
                  >
                    <template v-slot:label>
                      <v-icon class="float-left">{{ conf.icon('User') }}</v-icon>
                      {{ user.name }}
                    </template>
                  </v-checkbox>
                  <v-checkbox
                    v-else
                    dense
                    v-model="user.checked"
                  >
                    <template v-slot:label>
                      <v-icon class="float-left">{{ conf.icon('User') }}</v-icon>
                      {{ user.name }}
                    </template>
                  </v-checkbox>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <DefaultButton
            color="secondary"
            class="mr-2"
            :icon="conf.icon('Cancel')"
            :label="$t('Cancel')"
            @click="page.dialog = false"
          />
          <DefaultButton
            color="primary"
            :icon="conf.icon('OK')"
            :label="$t('Save')"
            :disabled="!!state.waitProc"
            @click="onSave(page.groups, page.users)"
          />
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import { useStore, sortedGroups } from '@/store'
import DefaultButton from '@/components/DefaultButton'

export default {
  name: 'PermittedMembers',
  components: {
    DefaultButton
  },
  props: {
    id: String
  },
  setup (props) {
    const store = useStore()
    const { state, waitFor, update, account } = store
    const page = reactive({
      dialog: false,
      groups: [],
      users: [],
      checked: true
    })

    return {
      ...store,
      page,
      groups: computed(() => sortedGroups(state)
        .filter(group => group.id !== 'managers')
        .map(group => ({
          ...group,
          checked: (account(props.id).permittedGroups || []).includes(group.id)
        }))
      ),
      users: computed(() => state.users
        .map(item => ({
          ...item,
          checked: item.id !== props.id && (account(props.id).permittedUsers || []).includes(item.id)
        }))
      ),
      onEdit: (groups, users) => {
        page.dialog = true
        page.groups = [...groups]
        page.users = [...users]
      },
      onSave: async (groups, users) => {
        await waitFor(() => update(account(props.id), {
          permittedGroups: groups.filter(item => item.checked).map(item => item.id),
          permittedUsers: users.filter(item => item.checked).map(item => item.id)
        }))
        page.dialog = false
      }
    }
  }
}
</script>
