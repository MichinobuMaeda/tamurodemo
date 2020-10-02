<template>
  <div>

    <span v-if="type === 'select' && items[0].value">
      {{ (items.find(item => item.value === value) || {}).text }}
    </span>
    <span v-else-if="type !== 'formatted-text'">
      {{ value }}
    </span>

    <v-icon
      v-if="editable"
      small
      :color="disabled ? 'grey' : 'primary'"
      :class="'ml-1' + (type === 'formatted-text' ? ' float-right' : '')"
      @click="() => disabled ? null : onEdit()"
    >
      {{ iconEdit }}
    </v-icon>

    <div
      v-if="type === 'formatted-text'"
      class="formatted-text"
      v-html="formatted()"
    ></div>

    <v-dialog
      :max-width="type === 'formatted-text' ? '1024px' : '640px'"
      v-model="state.edit"
    >
      <v-card>

        <v-card-title
          :class="'headline' + ($vuetify.theme.dark ? ' grey darken-2' : ' grey lighten-2')"
        >
          <v-icon
            color="primary"
            class="mr-2"
          >
            {{ iconEdit }}
          </v-icon>
          {{ label }}
          <v-spacer />
          <v-icon
            color="gray"
            @click="onCancel"
          >
            close
          </v-icon>
        </v-card-title>

        <v-card-text class="pb-1">
          <div
            v-if="type === 'formatted-text'"
          >
            <v-radio-group
              v-model="state.value.type"
              row
            >
              <v-radio
                label="書式無し"
                value="plain"
              />
              <v-radio
                label="Markdown"
                value="markdown"
              />
              <v-radio
                label="HTML"
                value="html"
              />
            </v-radio-group>
            <v-textarea
              outlined
              v-model="state.value.data"
              :rules="rules"
            />
          </div>
          <v-select
            v-else-if="type === 'select'"
            :items="items"
            v-model="state.value"
            :rules="rules"
          />
          <v-text-field
            v-else
            v-model="state.value"
            :rules="rules"
          />

        </v-card-text>

        <v-card-actions
          :class="$vuetify.theme.dark ? ' grey darken-3' : ' grey lighten-4'"
        >
          <v-spacer />
          <ButtonSecondary
            class="mr-2"
            :icon="iconCancel"
            :label="$t(labelCancel)"
            @click="onCancel"
          />
          <ButtonPrimary
            :icon="iconSave"
            :label="$t(labelSave)"
            :disabled="disabled || !modified() || !valid()"
            @click="onSave"
          />
        </v-card-actions>

        <v-card-text v-if="type === 'formatted-text'">
          <div class="formatted-text" v-html="formatted()"></div>
        </v-card-text>

      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { defaultIcons, defaultLabels  } from './defaults'
import { evalRules  } from './helpers'
import ButtonPrimary from './ButtonPrimary'
import ButtonSecondary from './ButtonSecondary'
import sanitizeHtml from "sanitize-html";
import marked from "marked";

export default {
  name: 'EditableItem',
  components: {
    ButtonPrimary,
    ButtonSecondary
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    type:{
      type: String,
      default: 'text'
    },
    value: [String, Number, Boolean, Array, Object],
    items: Array,
    rules: Array,
    label: String,
    editable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
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
  setup(props, { emit }) {
    const state = reactive({
      edit: false,
      value: getPropsValue(props)
    })

    const onEdit = () => {
      state.value = getPropsValue(props)
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

    const formatted = () => {
      if (state.value.type === 'markdown') {
        return sanitizeHtml(marked(state.value.data), { allowedTags })
      } else if (state.value.type === 'html') {
        return sanitizeHtml(state.value.data, { allowedTags })
      } else {
        return (state.value.data || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .split(/\n/)
          .map(line => `<div>${line || '&nbsp;'}</div>`)
          .join('\n')
      }
    }

    const modified = () => props.type === 'formatted-text'
      ? props.value.type !== state.value.type || props.value.data !== state.value.data
      : props.value !== state.value

    const valid = () => evalRules(
      props.rules,
      props.type === 'formatted-text' ? state.value.data : state.value
    )

    return {
      state,
      formatted,
      modified,
      onEdit,
      onCancel,
      onSave,
      valid
    }
  }
}

const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']

const getPropsValue = props => props.type === 'formatted-text' ? { ...props.value } : props.value
</script>
