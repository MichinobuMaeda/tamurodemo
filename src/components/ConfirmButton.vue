<template>
  <span>
    <DefaultButton
      :color="color || type"
      :class="buttonClass"
      :icon="buttonIcon || iconProc || defaultIcons.Confirmation"
      :label="title || defaultLabels.Confirmation"
      @click="state.dialog = true"
      :disabled="disabled"
    />
    <v-dialog
      max-width="640px"
      v-model="state.dialog"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon class="mr-2">{{ iconProc || defaultIcons.OK }}</v-icon>
          {{ title }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="state.dialog = false"
          >
            {{ iconCancel || defaultIcons.Cancel }}
          </v-icon>
        </v-card-title>

        <v-card-text class="pa-1">
          <v-alert :type="type" text class="ma-0">
            {{ message }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <DefaultButton
            color="secondary"
            class="mr-2"
            :icon="iconCancel || defaultIcons.Cancel"
            :label="labelCancel || $t(defaultLabels.Cancel)"
            @click="state.dialog = false"
          />
          <DefaultButton
            :color="type"
            :icon="iconProc || defaultIcons.OK"
            :label="labelProc || $t(defaultLabels.OK)"
            @click="onConfirm"
            :disabled="disabled"
          />
        </v-card-actions>

      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import { reactive } from '@vue/composition-api'
import DefaultButton from '@/components/DefaultButton'
import { defaultIcons, defaultLabels } from '@/components/defaults'

export default {
  name: 'ConfirmButton',
  components: {
    DefaultButton
  },
  props: {
    type: {
      type: String,
      default: 'info'
    },
    color: {
      type: String,
      default: null
    },
    buttonClass: String,
    buttonIcon: String,
    title: String,
    iconProc: String,
    labelProc: String,
    iconCancel: String,
    labelCancel: String,
    message: String,
    disabled: Boolean
  },
  setup (props, { emit }) {
    const state = reactive({
      dialog: false
    })

    const onConfirm = () => {
      emit('confirm')
      state.dialog = false
    }

    return {
      state,
      defaultIcons,
      defaultLabels,
      onConfirm
    }
  }
}
</script>
