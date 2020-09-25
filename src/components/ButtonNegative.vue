<template>
  <ButtonBase
    color="red"
    :icon="icon"
    :label="label"
    @click="$emit('click')"
    :disabled="disabled"
  />
</template>

<script>
import ButtonBase from './ButtonBase'

export default {
  name: 'ButtonNegative',
  components: {
    ButtonBase
  },
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
    }
  }
}
</script>
