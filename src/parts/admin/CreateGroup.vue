<template>
  <div>
    <DefaultButton
      color="primary"
      :icon="conf.icon('Add')"
      :label="$t('Create new', { type: $t('group') })"
      @click="page.dialog = true; page.name = ''"
    />
    <v-dialog
      max-width="640px"
      v-model="page.dialog"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon class="mr-2">{{ conf.icon('Add') }}</v-icon>
          {{ $t('Create new', { type: $t('group') }) }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="page.dialog = false; page.name = ''"
          >
            {{ conf.icon('Cancel') }}
          </v-icon>
        </v-card-title>

        <v-card-text>
          <v-text-field
            :label="$t('Group name')"
            v-model="page.name"
            :rules="[ruleRequired]"
          />
        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <DefaultButton
            color="secondary"
            class="mr-2"
            :icon="conf.icon('Cancel')"
            :label="$t('Cancel')"
            @click="page.dialog = false; page.name = ''"
          />
          <DefaultButton
            color="primary"
            :icon="conf.icon('OK')"
            :label="$t('Create')"
            :disabled="!!state.waitProc || !page.name"
            @click="createGroup"
          />
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useStore } from '../../store'
import DefaultButton from '../../components/DefaultButton'

export default {
  name: 'CreateGroup',
  components: {
    DefaultButton
  },
  setup () {
    const store = useStore()
    const { db, waitFor, add, goPageGroup } = store
    const page = reactive({
      dialog: false,
      name: ''
    })

    const createGroup = async () => {
      const group = await waitFor(() => add(db.collection('groups'), {
        name: page.name,
        desc: { type: 'plain', data: '' },
        members: []
      }))
      return goPageGroup(group.id)
    }

    return {
      ...store,
      page,
      createGroup
    }
  }
}
</script>
