<template>
  <div>
    <DefaultButton
      color="primary"
      :icon="conf.icon('Add')"
      :label="$t('Create new', { type: $t('group') })"
      @click="page.edit = true; page.name = ''"
    />
    <v-bottom-sheet v-model="page.edit" inset>
      <v-sheet class="text-center pt-4 pb-8 px-2">
        <v-icon class="mr-2">{{ conf.icon('Add') }}</v-icon>
        {{ $t('Create new', { type: $t('group') }) }}

        <v-text-field
          outlined
          :label="$t('Group name')"
          v-model="page.name"
          :rules="[ruleRequired]"
          autofocus
        />

        <DefaultButton
          color="secondary"
          class="mr-2"
          :icon="conf.icon('Cancel')"
          :label="$t('Cancel')"
          @click="page.edit = false; page.name = ''"
        />
        <DefaultButton
          color="primary"
          :icon="conf.icon('OK')"
          :label="$t('Create')"
          :disabled="!!state.waitProc || !page.name"
          @click="createGroup"
        />
      </v-sheet>
    </v-bottom-sheet>
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
      edit: false,
      name: ''
    })

    return {
      ...store,
      page,
      createGroup: async () => {
        const group = await waitFor(() => add(db.collection('groups'), {
          name: page.name,
          desc: { type: 'plain', data: '' },
          members: []
        }))
        goPageGroup(group.id)
        page.edit = false
        page.name = ''
      }
    }
  }
}
</script>
