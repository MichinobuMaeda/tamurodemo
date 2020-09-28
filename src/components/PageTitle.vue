<template>
  <div :class="textColor + ' text-h5 mb-4'">
    <v-icon :color="iconColor" large>{{ icon }}</v-icon>
    {{ title }}
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
