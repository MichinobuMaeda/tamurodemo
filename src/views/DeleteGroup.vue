<template>
  <div>
    <ButtonNegative
      :icon="icon('Delete')"
      :label="$t('Delete item', { name: group.name })"
      @click="page.dialog = true"
    />
    <v-dialog
      max-width="640px"
      v-model="page.dialog"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon>{{ icon('Delete') }}</v-icon>
          {{ $t('Delete item', { name: group.name }) }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="page.dialog = false"
          >
            {{ icon('Cancel') }}
          </v-icon>
        </v-card-title>

        <v-card-text>
          <v-alert type="error" text dense class="mt-2">
            {{ $t('Confirm deletion', { name: group.name }) }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <ButtonSecondary
            class="mr-2"
            :icon="icon('Cancel')"
            :label="$t('Cancel')"
            @click="page.dialog = false"
          />
          <ButtonNegative
            :icon="icon('OK')"
            :label="$t('Delete')"
            :disabled="!!state.waitProc"
            @click="() => del('groups', group.id)"
          />
        </v-card-actions>

      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
import ButtonNegative from '@/components/ButtonNegative'
import ButtonSecondary from '@/components/ButtonSecondary'

const { useStore } = helpers

export default {
  name: 'DeleteGroup',
  components: {
    ButtonNegative,
    ButtonSecondary
  },
  props: {
    group: Object
  },
  setup (props, { root }) {
    const store = useStore()
    const page = reactive({
      dialog: false
    })

    return {
      ...store,
      page,
      ...helpers
    }
  }
}
</script>
