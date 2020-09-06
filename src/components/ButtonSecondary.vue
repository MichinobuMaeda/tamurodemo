<template>
  <ButtonBase
    color="secondary"
    :icon="icon"
    :label="label"
    @action="$emit('action')"
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
  props: ['icon', 'label', 'action', 'disabled']
}
</script>
