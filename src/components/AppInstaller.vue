<template>
  <DefaultButton
    v-if="state.pwaDeferredPrompt"
    :color="color"
    :icon="icon"
    :label="label"
    @click="onClickAppInstall"
  />
</template>

<script>
import { reactive } from '@vue/composition-api'
import DefaultButton from './DefaultButton'

// https://developers.google.com/web/ilt/pwa/lab-offline-quickstart
let pwaDeferredPromptEvent
window.addEventListener('beforeinstallprompt', event => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  event.preventDefault()

  // Stash the event so it can be triggered later.
  pwaDeferredPromptEvent = event
})

export default {
  name: 'AppInstaller',
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
    const state = reactive({
      pwaDeferredPrompt: pwaDeferredPromptEvent
    })

    const onClickAppInstall = () => {
      // Show the prompt
      state.pwaDeferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      state.pwaDeferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt')
          } else {
            console.log('User dismissed the A2HS prompt')
          }
          state.pwaDeferredPrompt = null
        })
    }

    return {
      state,
      onClickAppInstall
    }
  }
}
</script>
