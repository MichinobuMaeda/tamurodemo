<template>
  <div class="text-center">
    <ButtonBase
      :color="color"
      :icon="icon"
      :label="label"
      @click="updateApp"
    />
  </div>
</template>

<script>
import ButtonBase from './ButtonBase'

export default {
  name: 'AppUpdater',
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
    color: {
      type: String,
      default: 'orange darken-4'
    }
  },
  setup () {
    const updateApp = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      registrations.forEach(registration => {
        registration.unregister()
      })
      document.location.reload(true)
    }
    return {
      updateApp
    }
  }
}
</script>
