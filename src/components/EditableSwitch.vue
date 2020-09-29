<template>
  <div>
    <v-switch
      v-if="state.edit"
      v-model="state.value"
      :label="items.reduce((ret, cur) => cur === value ? value : (cur.value === value ? cur.text : ret), '')"
    >
      <template v-slot:append>
        <MiniButton
          class="mr-2"
          :icon="iconCancel"
          @click="onCancel"
        />
        <MiniButton
          :icon="iconSave"
          :disabled="disabled || value === state.value || !evalRules(rules, state.value)"
          @click="onSave"
        />
      </template>
    </v-switch>
    <div v-else>
      <MiniButton
        v-if="editable"
        class="float-right"
        :icon="iconEdit"
        @click="onEdit"
      />
      {{ items.reduce((ret, cur) => cur === value ? value : (cur.value === value ? cur.text : ret), '') }}
    </div>
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { evalRules } from './helper'
import MiniButton from './MiniButton'

export default {
  name: 'EditableSelect',
  components: {
    MiniButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    value: Boolean,
    items: Array,
    rules: Array,
    editable: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    iconEdit: String,
    iconCancel: String,
    iconSave: String
  },
  setup(props, { emit }) {
    const state = reactive({
      edit: false,
      value: props.value,
    })

    const onEdit = () => {
      state.value = props.value
      state.edit = true
    }

    const onCancel = () => {
      state.edit = false
      state.value = props.value
    }

    const onSave = () => {
      state.edit = false
      emit('save', state.value)
    }

    return {
      state,
      onEdit,
      onCancel,
      onSave,
      evalRules
    }
  }
}
</script>
