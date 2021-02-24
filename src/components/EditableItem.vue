<template>
  <span>

    <MiniButton
      v-if="editable"
      class="ml-1 float-right"
      :icon="iconEdit || defaultIcons.Edit"
      @click="() => disabled ? null : onEdit()"
      :disabled="disabled"
    />

    <span v-if="type === 'linked-chips'">
      <div v-if="editable && !(org.value || []).length" class="deleted--text">
        {{ placeholder || label }}
      </div>
      <LinkButton
        v-else
        v-for="(v, index) in (org.value || [])" :key="index"
        :icon="(items.find(item => item.value === v) || {}).icon"
        :label="(items.find(item => item.value === v) || {}).text"
        @click="$emit('click', v)"
      />
    </span>
    <span v-else-if="type === 'chips' && items[0] && items[0].value">
      <div v-if="editable && !(org.value || []).length" class="deleted--text">
        {{ placeholder || label }}
      </div>
      <v-chip
        v-else
        outlined
        :color="(items.find(item => item.value === v) || {}).color || 'secondary'"
        class="ma-1"
        v-for="(v, index) in (org.value || [])" :key="index"
      >
        <v-icon left>{{ (items.find(item => item.value === v) || {}).icon }}</v-icon>
        {{ (items.find(item => item.value === v) || {}).text }}
      </v-chip>
    </span>
    <span class="ma-1" v-else-if="type === 'chips' && !(items[0] && items[0].value)">
      <div v-if="editable && !(org.value || []).length" class="deleted--text">
        {{ placeholder || label }}
      </div>
      <v-chip
        v-else
        outlined
        class="ma-1"
        v-for="(v, index) in (org.value || [])" :key="index"
      >
        {{ v }}
      </v-chip>
    </span>
    <span v-else-if="type === 'select' && items[0] && items[0].value">
      {{ (items.find(item => item.value === org.value) || {}).text }}
    </span>
    <span v-else-if="!['formatted-text', 'textarea'].includes(type) && value">
      {{ org.value }}
    </span>
    <span v-else-if="!['formatted-text', 'textarea'].includes(type) && !value" class="deleted--text">
      {{ placeholder }}
    </span>
    <div
      v-else-if="type === 'formatted-text' && value && value.data"
      class="formatted-text"
      v-html="format(org.value)"
    ></div>
    <div v-else-if="type === 'formatted-text'" class="deleted--text">
      {{ placeholder }}
    </div>
    <div v-else-if="type === 'textarea'">
      <div v-if="!value" class="deleted--text">
        {{ placeholder }}
      </div>
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

        <v-card-text
          class="pb-1"
          :style="['select', 'chips', 'linked-chips'].includes(type) ? 'height: 360px' : ''"
        >
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
              autofocus
            />
          </div>
          <v-select
            v-else-if="['select', 'chips', 'linked-chips'].includes(type)"
            :chips="['chips', 'linked-chips'].includes(type)"
            :multiple="['chips', 'linked-chips'].includes(type)"
            :items="items"
            v-model="state.value"
            :rules="rules"
            autofocus
          />
          <v-textarea
            v-else-if="['textarea'].includes(type)"
            outlined class="mt-2"
            v-model="state.value"
            :placeholder="placeholder"
            :rules="rules"
            autofocus
          />
          <v-text-field
            v-else
            :type="type"
            v-model="state.value"
            :placeholder="placeholder"
            :rules="rules"
            autofocus
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
            :disabled="disabled || !modified || !valid"
            @click="onSave"
          />
        </v-card-actions>

        <v-card-text v-if="type === 'formatted-text'">
          <div class="formatted-text" v-html="format(state.value)"></div>
        </v-card-text>

      </v-card>
    </v-dialog>

  </span>
</template>

<script>
import sanitizeHtml from 'sanitize-html'
import marked from 'marked'
import { toRefs, reactive, computed /*, watch, onMounted */ } from '@vue/composition-api'
import { defaultIcons, defaultLabels } from './defaults'
import { evalRules } from './helpers'
import DefaultButton from './DefaultButton'
import LinkButton from './LinkButton'
import MiniButton from './MiniButton'

const allowedTags = ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']

const getPropsValue = (type, value) => type === 'formatted-text'
  ? (value && value.type ? { ...value } : { type: 'plain', data: '' })
  : type === 'chips'
    ? [...value]
    : value

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
    placeholder: String,
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
    const { type, value } = toRefs(props)
    const state = reactive({
      edit: false,
      value: getPropsValue(props.type, props.value)
    })
    const org = reactive({
      value: getPropsValue(type.value, value.value)
    })

    // onMounted(() => {
    //   console.log('onMounted', value.value)
    //   org.value = getPropsValue(type.value, value.value)
    // })
    // watch(value, value => {
    //   console.log('watch', value.value)
    //   org.value = getPropsValue(type.value, value.value)
    // })

    return {
      org,
      state,
      defaultIcons,
      defaultLabels,
      modified: computed(() => props.type === 'formatted-text'
        ? !props.value || props.value.type !== state.value.type || props.value.data !== state.value.data
        : props.type === 'chips'
          ? (props.value || []).length !== (state.value || []).length ||
          !(props.value || []).reduce(
            (ret, cur) => ret && (state.value || []).includes(cur),
            true
          )
          : props.value !== state.value
      ),
      valid: computed(() => evalRules(
        props.rules,
        props.type === 'formatted-text' ? state.value.data : state.value
      )),
      onEdit: () => {
        state.value = getPropsValue(props.type, props.value)
        state.edit = true
      },
      onCancel: () => {
        state.edit = false
        state.value = getPropsValue(props.type, props.value)
      },
      onSave: () => {
        state.edit = false
        emit('save', state.value)
      },
      format: value => value && value.type === 'markdown'
        ? sanitizeHtml(marked(value.data || ''), { allowedTags })
        : value && value.type === 'html'
          ? sanitizeHtml(value.data || '', { allowedTags })
          : (value.data || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .split(/\n/)
            .map(line => `<div>${line || '&nbsp;'}</div>`)
            .join('\n')
    }
  }
}
</script>
