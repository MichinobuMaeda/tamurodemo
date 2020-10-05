<template>
  <v-btn
    class="my-1 mx-2"
    :dark="$vuetify.theme.dark"
    :light="!$vuetify.theme.dark"
    :color="color"
    @click="$emit('click')"
    :disabled="disabled"
  >
    <v-icon v-if="icon" :class="label ? 'mr-1' : ''">{{ icon }}</v-icon>
    {{ label }}
  </v-btn>
</template>

<script>
export default {
  name: 'DefaultButton',
  props: {
    icon: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
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
