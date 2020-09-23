<template>
  <ButtonBase
    color="primary"
    :icon="icon"
    :label="label"
    @click="$emit('click')"
    :disabled="disabled"
  />
</template>

<script>
import ButtonBase from './ButtonBase'

export default {
  name: 'ButtonPrimary',
  components: {
    ButtonBase
  },
  props: ['icon', 'label', 'click', 'disabled']
}
</script>
