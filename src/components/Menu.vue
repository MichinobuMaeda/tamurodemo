<template>
  <v-layout column class="fab-container pa-2">
    <div
      v-for="(item, index) in menuItems(state, $router).filter(item => item.visible)" :key="index"
      class="text-center pb-2"
    >
      <v-tooltip
        left
        v-if="state.menuOpened"
        :value="state.toolChip"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            dark
            fab
            small
            color="light-green darken-4"
            @click="state.menuOpened = !state.menuOpened; item.action()"
          >
            <v-icon>{{ item.icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ item.label }}</span>
      </v-tooltip>
    </div>
    <v-btn
      dark
      fab
      color="light-green darken-2"
      @click="showToolChip(state); state.menuOpened = !state.menuOpened"
    >
      <v-icon v-if="state.menuOpened">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
  </v-layout>
</template>

<style>
  .fab-container {
    position: fixed;
    bottom: 0;
    right: 0;
  }
</style>

<script>
import store from '../plugins/composition-api'

export default {
  name: 'Menu',
  setup () {
    return store.useStore()
  }
}
</script>
