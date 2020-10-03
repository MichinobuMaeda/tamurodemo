<template>
  <div class="mb-4 text-h2" style="vertical-align: baseline;">
    <v-icon :color="iconColor" size="1.8rem">{{ icon }}</v-icon>
    <span :class="textColor">
      <slot name="title"></slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    icon: {
      type: String
    },
    textColor: {
      type: String,
      default: 'primary--text'
    },
    iconColor: {
      type: String,
      default: 'primary'
    }
  }
}
</script>
