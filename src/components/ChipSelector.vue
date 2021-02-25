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
        height="640px"
      >
        <p>{{ label }}</p>
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
        <v-row class="justify-center">
          <v-col class="col-auto">
            <v-select
              :chips="true"
              :multiple="true"
              :items="items"
              v-model="state.value"
              autofocus
            />
          </v-col>
        </v-row>
      </v-sheet>
    </v-bottom-sheet>
    <span v-if="clickable">
      <span v-if="editable && !(value || []).length" class="deleted--text">
        {{ placeholder || label }}
      </span>
      <LinkButton
        v-for="(v, index) in (value || [])" :key="index"
        :icon="(items.find(item => item.value === v) || {}).icon"
        :label="(items.find(item => item.value === v) || {}).text"
        @click="$emit('click', v)"
      />
    </span>
    <span v-else>
      <div v-if="editable && !(value || []).length" class="deleted--text">
        {{ placeholder || label }}
      </div>
      <v-chip
        v-else
        outlined
        :color="(items.find(item => item.value === v) || {}).color || 'secondary'"
        class="ma-1"
        v-for="(v, index) in (value || [])" :key="index"
      >
        <v-icon left>{{ (items.find(item => item.value === v) || {}).icon }}</v-icon>
        {{ (items.find(item => item.value === v) || {}).text }}
      </v-chip>
    </span>
  </span>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import { defaultIcons, defaultLabels } from './defaults'
import DefaultButton from './DefaultButton'
import MiniButton from './MiniButton'
import LinkButton from './LinkButton'
import { evalRules } from './helpers'

export default {
  name: 'ChipSelector',
  components: {
    DefaultButton,
    MiniButton,
    LinkButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    value: Array,
    label: String,
    items: Array,
    clickable: {
      type: Boolean,
      default: false
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
      value: [...props.value]
    })

    return {
      state,
      valid: computed(() => evalRules(props.rules, state.value)),
      onEdit: () => {
        state.edit = true
        state.value = [...props.value]
      },
      onCancel: () => {
        state.edit = false
        state.value = [...props.value]
      },
      onSave: () => {
        state.edit = false
        emit('save', state.value)
      }
    }
  }
}
</script>
