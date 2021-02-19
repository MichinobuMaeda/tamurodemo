<template>
  <v-card>
    <v-card-title
      class="h3--text text-h3 my-2 pa-2"
      @click="goPage(current === target ? { name: 'admin' } : { name: 'admin', params: { target: target } })"
    >
      <v-icon color="h3" class="mr-1">{{ sectionIcon }}</v-icon>
      {{ label }}
      <v-spacer />
      <v-icon>{{ conf.icon(current === target ? 'Shrink' : 'Expand') }}</v-icon>
    </v-card-title>
  </v-card>
</template>

<script>
import { useStore } from '../../store'

export default {
  name: 'AdminSectionHeader',
  model: {
    prop: 'current',
    event: 'change'
  },
  props: {
    current: String,
    target: String,
    sectionIcon: String,
    label: String
  },
  setup () {
    const store = useStore()

    return {
      ...store
    }
  }
}
</script>
