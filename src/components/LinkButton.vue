<template>
  <v-btn
    class="ma-1"
    text
    :color="color"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <v-icon small v-if="icon" :class="label ? 'mr-1' : ''">{{ icon }}</v-icon>
    <span class="text-decoration-underline">{{ label }}</span>
  </v-btn>
</template>

<script>
export default {
  name: 'LinkButton',
  props: {
    icon: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    click: {
      type: Function,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary'
    }
  }
}
</script>
