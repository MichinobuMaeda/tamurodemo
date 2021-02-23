<template>
  <v-container fill-height>
    <v-row justify="center">
      <v-col class="text-center pa-4">
        <p v-if="message">{{ message }}</p>
        <v-progress-circular
          indeterminate
          :size="size"
          :color="color"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    color: {
      type: String,
      default: 'blue darken-2'
    },
    size: {
      type: Number,
      default: 64
    },
    message: String
  }
}
</script>
