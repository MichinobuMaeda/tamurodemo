<template>
  <v-bottom-sheet
    v-if="state.pwaDeferredPrompt"
    v-model="state.sheet"
    inset
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="color"
        :dark="$vuetify.theme.dark"
        :light="!$vuetify.theme.dark"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon v-if="icon" :class="label ? 'mr-1' : ''">{{ icon }}</v-icon>
        {{ label }}
      </v-btn>
    </template>
    <v-sheet
      class="text-center"
      height="200px"
    >
      <p>
        <v-icon @click="onClickAppInstall">{{ icon }}</v-icon>
        {{ descOk }}
      </p>
      <p>
        <v-icon @click="onClickAppInstall">{{ icon }}</v-icon>
        {{ descCancel }}
      </p>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
import { reactive } from '@vue/composition-api'

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
  props: {
    icon: String,
    iconCancel: String,
    label: String,
    descOk: String,
    descCancel: String,
    color: {
      type: String,
      default: 'info'
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      pwaDeferredPrompt: pwaDeferredPromptEvent,
      sheet: false
    })

    return {
      state,
      onClickAppInstall: () => {
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
            state.sheet = false
          })
      },
      onCancel: () => {
        state.sheet = false
        emit('cancel')
      }
    }
  }
}
</script>
