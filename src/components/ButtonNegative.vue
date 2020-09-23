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
  props: ['icon', 'label', 'click', 'disabled']
}
</script>
