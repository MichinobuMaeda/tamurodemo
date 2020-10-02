<template>
  <div class="mb-4 text-h2" style="vertical-align: baseline;">
    <v-icon :color="iconColor" size="1.8rem">{{ icon }}</v-icon>
    <span :class="textColor">
      {{ title }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String
    },
    icon: {
      type: String
    },
    textColor: {
      type: String,
      default: 'blue--text text--darken-3'
    },
    iconColor: {
      type: String,
      default: 'blue darken-3'
    }
  }
}
</script>
