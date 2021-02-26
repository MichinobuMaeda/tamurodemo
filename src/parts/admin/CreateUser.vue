<template>
  <div>
    <DefaultButton
      color="primary"
      :icon="conf.icon('Add')"
      :label="$t('Create new', { type: $t('user') })"
      @click="page.edit = true; page.name = ''"
    />
    <v-bottom-sheet v-model="page.edit" inset>
      <v-sheet class="text-center pt-4 pb-8 px-2">
        <v-icon class="mr-2">{{ conf.icon('Add') }}</v-icon>
        {{ $t('Create new', { type: $t('user') }) }}

        <v-text-field
          outlined
          :label="$t('Display name')"
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
          @click="createUser"
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
  name: 'CreateUser',
  components: {
    DefaultButton
  },
  setup () {
    const store = useStore()
    const { waitFor, functions, goPageUser } = store
    const page = reactive({
      edit: false,
      name: ''
    })

    return {
      ...store,
      page,
      createUser: () => waitFor(async () => {
        const result = await functions.httpsCallable('createAccount')({ name: page.name })
        goPageUser(result.data.id, true)
        page.edit = false
        page.name = ''
      })
    }
  }
}
</script>
