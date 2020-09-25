<template>
  <v-container fill-height>
    <v-row justify="center">
      <v-col class="text-center">
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
    }
  }
}
</script>
