<template>
  <span>
    <MiniButton
      v-if="editable"
      class="ml-1 float-right"
      :icon="iconEdit"
      @click="() => disabled ? null : onEdit()"
      :disabled="disabled || state.edit"
    />
    <v-bottom-sheet v-model="state.edit" inset>
      <v-sheet
        class="text-center pt-4 pb-8 px-2"
      >
        <div>{{ label }}</div>
        <v-row class="justify-center">
          <v-col class="col-auto mt-4 mb-8">
            <v-switch
              class="inline-block"
              v-model="state.value"
            >
              <template v-slot:label>
                <v-icon v-if="iconTrue && iconFalse" class="mr-1">{{ state.value ? iconTrue : iconFalse }}</v-icon>
                {{ state.value ? labelTrue : labelFalse }}
              </template>
            </v-switch>
          </v-col>
        </v-row>
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
          :disabled="disabled || !!value === !!state.value || !valid"
          @click="onSave"
        />
      </v-sheet>
    </v-bottom-sheet>
    <span :class="textClass">
      <v-icon v-if="iconTrue && iconFalse" class="mr-1">{{ state.value ? iconTrue : iconFalse }}</v-icon>
      {{ state.value ? labelTrue : labelFalse }}
    </span>
  </span>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import { defaultIcons, defaultLabels } from './defaults'
import DefaultButton from './DefaultButton'
import MiniButton from './MiniButton'
import { evalRules } from './helpers'

export default {
  name: 'OnOffEditor',
  components: {
    DefaultButton,
    MiniButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    value: [String, Number, Boolean],
    label: String,
    iconTrue: String,
    labelTrue: {
      type: String,
      default: 'On'
    },
    iconFalse: String,
    labelFalse: {
      type: String,
      default: 'Off'
    },
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
      value: !!props.value
    })

    return {
      state,
      valid: computed(() => evalRules(props.rules, state.value)),
      onEdit: () => {
        state.edit = true
        state.value = !!props.value
      },
      onCancel: () => {
        state.edit = false
        state.value = !!props.value
      },
      onSave: () => {
        state.edit = false
        emit('save', state.value)
      }
    }
  }
}
</script>
