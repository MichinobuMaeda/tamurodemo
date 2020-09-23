<template>
  <div class="compiled-markdown" v-html="compiled"></div>
</template>

<style>
.compiled-markdown {
  line-height: 1.8em;
  padding: 0.5em 0  0.5em 0;
}
.compiled-markdown h2,
.compiled-markdown h3,
.compiled-markdown h4,
.compiled-markdown h5,
.compiled-markdown h6 {
  font-weight: normal;
  margin: 0.5em 0 1em 0;
}
.compiled-markdown h2 {
  font-size: 200%;
}
.compiled-markdown h3 {
  font-size: 160%;
}
.compiled-markdown h4 {
  font-size: 140%;
}
.compiled-markdown h5 {
  font-size: 120%;
}
.compiled-markdown h6 {
  font-size: 110%;
}
.compiled-markdown ol,
.compiled-markdown ul {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
</style>

<script>
import sanitizeHtml from "sanitize-html";
import marked from "marked";

export default {
  name: 'Markdown',
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  computed: {
    compiled () {
     return sanitizeHtml(marked(this.src), {
       allowedTags: ['h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
         'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'abbr', 'code', 'hr', 'br', 'div',
         'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre']
     })
    }
  }
}
</script>
