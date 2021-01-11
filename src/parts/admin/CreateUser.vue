<template>
  <div>
    <DefaultButton
      color="primary"
      :icon="icon('Add')"
      :label="$t('Create new', { type: $t('user') })"
      @click="page.dialog = true; page.name = ''"
    />
    <v-dialog
      max-width="640px"
      v-model="page.dialog"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon class="mr-2">{{ icon('Add') }}</v-icon>
          {{ $t('Create new', { type: $t('user') }) }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="page.dialog = false; page.name = ''"
          >
            {{ icon('Cancel') }}
          </v-icon>
        </v-card-title>

        <v-card-text>
          <v-text-field
            :label="$t('Display name')"
            v-model="page.name"
            :rules="[ruleRequired]"
          />
        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <DefaultButton
            color="secondary"
            class="mr-2"
            :icon="icon('Cancel')"
            :label="$t('Cancel')"
            @click="page.dialog = false; page.name = ''"
          />
          <DefaultButton
            color="primary"
            :icon="icon('OK')"
            :label="$t('Create')"
            :disabled="!!state.waitProc || !page.name"
            @click="createUser"
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
  name: 'CreateUser',
  components: {
    DefaultButton
  },
  setup (props, { root }) {
    const store = useStore()
    const { setProcForWait, functions, goPageUser } = store
    const page = reactive({
      dialog: false,
      name: ''
    })

    const createUser = () => setProcForWait(async () => {
      const result = await functions.httpsCallable('createAccount')({ name: page.name })
      return goPageUser(result.data.id)
    })

    return {
      ...store,
      page,
      createUser
    }
  }
}
</script>
