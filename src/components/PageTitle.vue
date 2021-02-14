<template>
  <div class="text-h2 pt-1">
    <v-icon
      v-if="icon"
      :color="iconColor"
      size="2rem"
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
