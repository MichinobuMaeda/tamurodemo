<template>
  <v-btn
    class="ma-2"
    :rounded="!!label"
    :outlined="!!label"
    :fab="!label"
    :small="!label"
    :dark="!label"
    :color="color"
    @click="$emit('action')"
    :disabled="disabled"
  >
    <v-icon v-if="icon">{{ icon }}</v-icon>
    {{ label }}
  </v-btn>
</template>

<script>
export default {
  name: 'ButtonBase',
  props: {
    icon: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    action: {
      type: Function,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'secondary'
    }
  }
}
</script>
