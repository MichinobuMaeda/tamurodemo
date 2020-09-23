<template>
  <ButtonBase
    color="secondary"
    :icon="icon"
    :label="label"
    @click="$emit('click')"
    :disabled="disabled"
  />
</template>

<script>
import ButtonBase from './ButtonBase'

export default {
  name: 'ButtonSecondary',
  components: {
    ButtonBase
  },
  props: ['icon', 'label', 'click', 'disabled']
}
</script>
