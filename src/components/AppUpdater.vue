<template>
  <div class="text-center">
    <DefaultButton
      :color="color"
      :icon="icon"
      :label="label"
      @click="updateApp"
    />
  </div>
</template>

<script>
import DefaultButton from './DefaultButton'

export default {
  name: 'AppUpdater',
  components: {
    DefaultButton
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
      default: 'info'
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
