<template>
  <div>
    <v-text-field
      v-if="state.edit"
      v-model="state.value"
      :rules="rules"
    >
      <template v-slot:append>
        <MiniButton
          class="mr-2"
          :icon="iconCancel"
          @click="onCancel"
        />
        <MiniButton
          :icon="iconSave"
          :disabled="value === state.value"
          @click="onSave"
        />
      </template>
    </v-text-field>
    <div v-else>
      <MiniButton
        v-if="editable"
        class="float-right"
        :icon="iconEdit"
        @click="onEdit"
      />
      {{ value }}
    </div>
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import MiniButton from './MiniButton'

export default {
  name: 'EditableText',
  components: {
    MiniButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    value: String,
    rules: Array,
    editable: {
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
      onSave
    }
  }
}
</script>
