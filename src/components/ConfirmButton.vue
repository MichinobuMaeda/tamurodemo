<template>
  <span>
    <DefaultButton
      :color="color || type"
      :class="buttonClass"
      :icon="buttonIcon || iconProc || defaultIcons.Confirmation"
      :label="title || defaultLabels.Confirmation"
      @click="state.show = true"
      :disabled="disabled"
    />
    <v-bottom-sheet
      inset
      v-model="state.show"
    >
      <v-sheet
        class="text-center pb-8"
      >
        <v-alert :type="type" text class="mb-4">
          {{ message }}
        </v-alert>
        <DefaultButton
          color="secondary"
          class="mr-2"
          :icon="iconCancel || defaultIcons.Cancel"
          :label="labelCancel || $t(defaultLabels.Cancel)"
          @click="state.show = false"
        />
        <DefaultButton
          :color="type"
          :icon="iconProc || defaultIcons.OK"
          :label="labelProc || $t(defaultLabels.OK)"
          @click="onConfirm"
          :disabled="disabled"
        />
      </v-sheet>
    </v-bottom-sheet>
  </span>
</template>

<script>
import { reactive } from '@vue/composition-api'
import DefaultButton from './DefaultButton'
import { defaultIcons, defaultLabels } from './defaults'

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
      show: false
    })

    const onConfirm = () => {
      emit('confirm')
      state.show = false
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
