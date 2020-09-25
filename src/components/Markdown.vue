<template>
  <div class="compiled-markdown" v-html="state.compiled"></div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import sanitizeHtml from "sanitize-html";
import marked from 'marked'

export default {
  name: 'Markdown',
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const state = reactive({
      compiled: computed(() => sanitizeHtml(marked(props.src), {
        allowedTags: ['h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
          'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
          'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']
      }))
    })
    return {
      state
    }
  }
}
</script>
