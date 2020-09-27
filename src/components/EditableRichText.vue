<template>
  <div>
    <div v-if="editable">
      <div v-if="state.edit">
        <div>
          <v-textarea
            outlined
            v-model="state.data"
          />
        </div>
        <v-row>
          <v-col class="justify-center">
            <v-select
              outlined
              :items="['plain', 'markdown', 'html']"
              v-model="state.type"
            ></v-select>
          </v-col>
          <v-col class="text-right">
            <ButtonSecondary
              :label="cancelText"
              @click="onCancel"
            />
            <ButtonPrimary
              :label="saveText"
              @click="onSave"
              :disabled="state.type === src.type && state.data === src.data"
            />
          </v-col>
        </v-row>
      </div>
      <div v-else class="float-right">
        <v-icon @click="onEdit" color="primary">{{ iconEdit }}</v-icon>
      </div>
    </div>
    <div class="compiled-markdown" v-html="state.edit ? compile(state) : state.compiled"></div>
  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import sanitizeHtml from 'sanitize-html'
import marked from 'marked'
import ButtonPrimary from './ButtonPrimary'
import ButtonSecondary from './ButtonSecondary'

const allowedTags = ['h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']

export default {
  name: 'EditableRichText',
  components: {
    ButtonPrimary,
    ButtonSecondary
  },
  model: {
    prop: 'src',
    event: 'save'
  },
  props: {
    src: {
      type: Object,
      default: () => ({
        type: 'plane',
        data: ''
      })
    },
    editable: {
      type: Boolean,
      default: false
    },
    iconEdit: String,
    cancelText: String,
    saveText: String
  },
  setup(props, { emit }) {
    const state = reactive({
      compiled: computed(() => compile(props.src)),
      edit: false,
      type: props.src.type,
      data: props.src.data
    })

    const onEdit = () => {
      state.type = props.src.type
      state.data = props.src.data
      state.edit = true
    }

    const onCancel = () => {
      state.edit = false
      state.type = props.src.type
      state.data = props.src.data
    }

    const onSave = () => {
      state.edit = false
      emit('save', {
        type: state.type,
        data: state.data
      })
    }

    const compile = src => {
      if (src.type === 'markdown') {
        return sanitizeHtml(marked(src.data), { allowedTags })
      } else if (src.type === 'html') {
        return sanitizeHtml(src.data, { allowedTags })
      } else {
        return (src.data || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .split(/\n/)
          .map(line => `<div>${line || '&nbsp;'}</div>`)
          .join('\n')
      }
    }

    return {
      state,
      onEdit,
      onCancel,
      onSave,
      compile
    }
  }
}
</script>
