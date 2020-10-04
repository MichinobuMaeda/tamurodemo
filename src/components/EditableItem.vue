<template>
  <span>

    <span v-if="type === 'linked-chips'">
      <LinkButton
        v-for="(v, index) in (value || [])" :key="index"
        :icon="(items.find(item => item.value === v) || {}).icon"
        :label="(items.find(item => item.value === v) || {}).text"
        @click="$emit('click', v)"
      />
    </span>
    <span v-else-if="type === 'chips' && items[0].value">
      <v-chip
        outlined
        :color="(items.find(item => item.value === v) || {}).color || 'secondary'"
        class="ma-1"
        v-for="(v, index) in (value || [])" :key="index"
      >
        <v-icon left>{{ (items.find(item => item.value === v) || {}).icon }}</v-icon>
        {{ (items.find(item => item.value === v) || {}).text }}
      </v-chip>
    </span>
    <span class="ma-1" v-else-if="type === 'chips' && !items[0].value">
      <v-chip
        outlined
        class="ma-1"
        v-for="(v, index) in (value || [])" :key="index"
      >
        {{ v }}
      </v-chip>
    </span>
    <span v-else-if="type === 'select' && items[0].value">
      {{ (items.find(item => item.value === value) || {}).text }}
    </span>
    <span v-else-if="!['formatted-text', 'textarea'].includes(type)">
      {{ value }}
    </span>

    <MiniButton
      v-if="editable"
      :class="'ml-1' + (['formatted-text', 'textarea'].includes(type) ? ' float-right' : '')"
      :icon="iconEdit || defaultIcons.Edit"
      @click="() => disabled ? null : onEdit()"
      :disabled="disabled"
    />

    <div
      v-if="type === 'formatted-text'"
      class="formatted-text"
      v-html="formatted()"
    ></div>
    <div v-if="type === 'textarea'">
      <div v-for="(line, index) in (value || '').split(/\n/)" :key="index">
        {{ line || '\u200C' }}
      </div>
    </div>

    <v-dialog
      :max-width="type === 'formatted-text' ? '1024px' : '640px'"
      v-model="state.edit"
    >
      <v-card>

        <v-card-title class="headline dialogTitle">
          <v-icon
            color="primary"
            class="mr-2"
          >
            {{ iconEdit || defaultIcons.Edit }}
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
          <div v-if="type === 'formatted-text'">
            <v-radio-group
              v-model="state.value.type"
              row
            >
              <v-radio
                :label="$t('Plain text')"
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
            v-else-if="['select', 'chips', 'linked-chips'].includes(type)"
            :chips="['chips', 'linked-chips'].includes(type)"
            :multiple="['chips', 'linked-chips'].includes(type)"
            :items="items"
            v-model="state.value"
            :rules="rules"
          />
          <v-textarea
            v-else-if="['textarea'].includes(type)"
            outlined class="mt-2"
            v-model="state.value"
            :rules="rules"
          />
          <v-text-field
            v-else
            v-model="state.value"
            :rules="rules"
          />

        </v-card-text>

        <v-card-actions class="dialogAction">
          <v-spacer />
          <DefaultButton
            color="secondary"
            class="mr-2"
            :icon="iconCancel || defaultIcons.Cancel"
            :label="labelCancel || $t(defaultLabels.Cancel)"
            @click="onCancel"
          />
          <DefaultButton
            color="primary"
            :icon="iconSave || defaultIcons.OK"
            :label="labelSave || $t(defaultLabels.Save)"
            :disabled="disabled || !modified() || !valid()"
            @click="onSave"
          />
        </v-card-actions>

        <v-card-text v-if="type === 'formatted-text'">
          <div class="formatted-text" v-html="formatted()"></div>
        </v-card-text>

      </v-card>
    </v-dialog>

  </span>
</template>

<script>
import sanitizeHtml from 'sanitize-html'
import marked from 'marked'
import { reactive, computed } from '@vue/composition-api'
import { defaultIcons, defaultLabels } from './defaults'
import { evalRules } from './helpers'
import DefaultButton from './DefaultButton'
import LinkButton from './LinkButton'
import MiniButton from './MiniButton'

export default {
  name: 'EditableItem',
  components: {
    DefaultButton,
    LinkButton,
    MiniButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    type: {
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
    iconEdit: String,
    iconCancel: String,
    labelCancel: String,
    iconSave: String,
    labelSave: String
  },
  setup (props, { emit }) {
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

    const valid = () => evalRules(
      props.rules,
      props.type === 'formatted-text' ? state.value.data : state.value
    )

    return {
      state,
      defaultIcons,
      defaultLabels,
      formatted: computed(() => () => formatted(state)),
      modified: computed(() => () => modified(props, state)),
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

const getPropsValue = props => props.type === 'formatted-text'
  ? { ...props.value }
  : props.type === 'chips'
    ? [...props.value]
    : props.value

const modified = (props, state) => props.type === 'formatted-text'
  ? props.value.type !== state.value.type || props.value.data !== state.value.data
  : props.type === 'chips'
    ? (props.value || []).length !== (state.value || []).length ||
    !(props.value || []).reduce(
      (ret, cur) => ret && (state.value || []).includes(cur),
      true
    )
    : props.value !== state.value

const formatted = state => {
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
</script>
