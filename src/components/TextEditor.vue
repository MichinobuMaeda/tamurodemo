<template>
  <span>
    <MiniButton
      v-if="editable"
      class="ml-1 float-right"
      :icon="iconEdit"
      @click="() => disabled ? null : onEdit()"
      :disabled="disabled || state.edit"
    />
    <v-bottom-sheet v-model="state.edit">
      <v-sheet
        class="text-center pt-4 pb-8 px-2"
      >
        <div class="text-left px-2">{{ label }}</div>
        <v-textarea
          v-if="multiline || type === 'multiline'"
          outlined
          v-model="state.value"
          autofocus
        />
        <v-text-field
          v-else
          outlined
          v-model="state.value"
          :placeholder="placeholder"
          :type="type"
          :rules="rules"
          autofocus
        />
        <DefaultButton
          color="secondary"
          class="mr-2"
          :icon="iconCancel"
          :label="$t(labelCancel)"
          @click="onCancel"
        />
        <DefaultButton
          color="primary"
          :icon="iconSave"
          :label="$t(labelSave)"
          :disabled="disabled || value === state.value || !valid"
          @click="onSave"
        />
      </v-sheet>
    </v-bottom-sheet>
    <span v-if="editable && !state.edit && !value" class="deleted--text">
      {{ placeholder }}
    </span>
    <span :class="textClass" v-if="!(multiline || type === 'multiline')">{{ value }}</span>
    <div v-else v-for="(line, index) in (value || '').split(/\n/)" :key="index">
      {{ line || '\u200C' }}
    </div>
  </span>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import { defaultIcons, defaultLabels } from './defaults'
import DefaultButton from './DefaultButton'
import MiniButton from './MiniButton'
import { evalRules } from './helpers'

export default {
  name: 'TextEditor',
  components: {
    DefaultButton,
    MiniButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    value: [String, Number],
    label: String,
    placeholder: String,
    multiline: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'text'
    },
    rules: Array,
    textClass: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      disabled: false
    },
    iconEdit: {
      type: String,
      default: defaultIcons.Edit
    },
    iconCancel: {
      type: String,
      default: defaultIcons.Cancel
    },
    labelCancel: {
      type: String,
      default: defaultLabels.Cancel
    },
    iconSave: {
      type: String,
      default: defaultIcons.OK
    },
    labelSave: {
      type: String,
      default: defaultLabels.Save
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      edit: false,
      value: props.value
    })

    return {
      state,
      valid: computed(() => evalRules(props.rules, state.value)),
      onEdit: () => {
        state.edit = true
        state.value = props.value
      },
      onCancel: () => {
        state.edit = false
        state.value = props.value
      },
      onSave: () => {
        state.edit = false
        emit('save', state.value)
      }
    }
  }
}
</script>
