<template>
  <v-bottom-sheet
    inset
    v-model="state.show"
    persistent
  >
    <v-sheet
      class="text-center pb-8"
    >
    <v-alert :type="color" text class="">
      {{ label }}
    </v-alert>
    <DefaultButton
      :color="color"
      label="OK"
      @click="updateApp"
    />
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
import { reactive } from '@vue/composition-api'
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
    const state = reactive({
      show: true
    })
    const updateApp = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      registrations.forEach(registration => {
        registration.unregister()
      })
      document.location.reload(true)
    }
    return {
      state,
      updateApp
    }
  }
}
</script>
