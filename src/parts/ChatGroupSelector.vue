<template>
  <v-chip-group
    active-class="primary--text"
    mandatory
    v-model="selected"
  >
    <v-chip
      v-for="group in groupsOfMe(state)" v-bind:key="group.id"
      :value="group.id"
    >
      <v-icon class="mr-1">{{ icon('Group') }}</v-icon>
      {{ group.name }}
    </v-chip>
  </v-chip-group>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore, groupsOfMe } from '@/store'

export default {
  name: 'ChatGroupSelector',
  model: {
    prop: 'id',
    event: 'change'
  },
  props: {
    id: String
  },
  setup (props, { emit }) {
    const store = useStore()

    return {
      selected: computed({
        get: () => store.state.me.chatSummaryExpand ? props.id : '',
        set: v => emit('change', v)
      }),
      ...store,
      groupsOfMe
    }
  }
}
</script>
