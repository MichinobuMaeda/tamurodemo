<template>
  <div>
    <MiniButton
      v-if="editable && (disabled || !state.edit)"
      class="ml-1 float-right"
      :icon="iconEdit"
      @click="() => disabled ? null : onEdit()"
      :disabled="disabled"
    />
    <v-card v-else-if="editable">
      <v-card-text class="py-1">
        <div>
          <v-radio-group
            v-model="state.type"
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
            v-model="state.data"
            autofocus
          />
        </div>
      </v-card-text>

      <v-card-actions class="dialogAction">
        <v-spacer />
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
          :disabled="disabled || (org.type === state.type && org.data === state.data)"
          @click="onSave"
        />
      </v-card-actions>
    </v-card>
    <div v-if="editable && !state.edit && !(value && value.data)" class="deleted--text">
      {{ placeholder }}
    </div>
    <div class="formatted-text" v-html="formatText(state.edit ? state : value)"></div>
  </div>
</template>

<script>
import marked from 'marked'
import sanitizeHtml from 'sanitize-html'
import { reactive } from '@vue/composition-api'
import { defaultIcons, defaultLabels } from './defaults'
import DefaultButton from './DefaultButton'
import MiniButton from './MiniButton'

export default {
  name: 'FormattedTextEditor',
  components: {
    DefaultButton,
    MiniButton
  },
  model: {
    prop: 'value',
    event: 'save'
  },
  props: {
    value: Object,
    placeholder: String,
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
    const org = {
      type: (props.value && props.value.type) || 'plain',
      data: (props.value && props.value.data) || ''
    }
    const state = reactive({
      edit: false,
      type: org.type,
      data: org.data
    })

    const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']

    return {
      state,
      org,
      formatText: value => value && value.type === 'markdown'
        ? sanitizeHtml(marked(value.data || ''), { allowedTags })
        : value && value.type === 'html'
          ? sanitizeHtml(value.data || '', { allowedTags })
          : ((value && value.data) || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .split(/\n/)
            .map(line => `<div>${line || '&nbsp;'}</div>`)
            .join('\n'),
      onEdit: () => {
        state.edit = true
        state.type = (props.value && props.value.type) || 'plain'
        state.data = (props.value && props.value.data) || ''
      },
      onCancel: () => {
        state.edit = false
        state.type = org.type
        state.data = org.data
      },
      onSave: () => {
        state.edit = false
        emit('save', { type: state.type, data: state.data })
      }
    }
  }
}
</script>
