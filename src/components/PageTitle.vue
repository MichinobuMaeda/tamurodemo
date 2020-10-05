<template>
  <div class="text-h2">
    <v-icon
      :color="iconColor"
      size="1.5rem"
      class="mr-1"
    >
      {{ icon }}
    </v-icon>
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
