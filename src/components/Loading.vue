<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-progress-circular
        indeterminate
        size="96"
        :color="color"
      />
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    color: {
      type: String,
      default: 'blue darken-2'
    }
  }
}
</script>
