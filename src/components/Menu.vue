<template>
  <div
    class="pa-2"
    :style="state.menuStyle"
  >
    <v-btn
      v-if="position.slice(0, 1) === 't'"
      dark
      fab
      :color="menuColor"
      @click="onMenuClick"
      @mousedown="state.mouseDown = true"
      @mouseup="state.mouseDown = false"
      @mouseleave="state.mouseDown = false"
      @mousemove="onMenuSwipe"
    >
      <v-icon v-if="state.menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
    <div
      v-for="(item, index) in state.items" :key="index"
      class="text-center py-2"
    >
      <v-tooltip
        :left="state.toolChipLeft"
        :right="state.toolChipRight"
        v-if="state.menuOpen"
        :value="state.toolChip"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            dark
            fab
            small
            :color="menuItemColor"
            @click="state.menuOpen = !state.menuOpen; item.action()"
          >
            <v-icon>{{ item.icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ Array.isArray(item.label) ? $t(item.label[0], item.label[1]) : $t(item.label) }}</span>
      </v-tooltip>
    </div>
    <v-btn
      v-if="position.slice(0, 1) === 'b'"
      dark
      fab
      :color="menuColor"
      @click="onMenuClick"
      @mousedown="state.mouseDown = true"
      @mouseup="state.mouseDown = false"
      @mouseleave="state.mouseDown = false"
      @mousemove="onMenuSwipe"
    >
      <v-icon v-if="state.menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'

const menuStyles = {
  tl: {
    position: 'fixed',
    'z-index': 999,
    top: 0,
    left: 0
  },
  tr: {
    position: 'fixed',
    'z-index': 999,
    top: 0,
    right: 0
  },
  bl: {
    position: 'fixed',
    'z-index': 999,
    bottom: 0,
    left: 0
  },
  br: {
    position: 'fixed',
    'z-index': 999,
    bottom: 0,
    right: 0
  }
}

export default {
  name: 'Menu',
  props: {
    menuColor: {
      type: String,
      default: 'blue darken-2'
    },
    menuItemColor: {
      type: String,
      default: 'blue darken-4'
    },
    position: {
      type: String,
      default: 'br'
    },
    menuItems: {
      type: Function,
      default: null
    },
    onMenuMoved: {
      type: Function,
      default: null
    },
  },
  setup(props) {
    const isTop = () => props.position.slice(0, 1) === 't'
    const isBottom = () => props.position.slice(0, 1) === 'b'
    const isLeft = () => props.position.slice(1) === 'l'
    const isRight = () => props.position.slice(1) === 'r'

    const state = reactive({
      menuOpen: false,
      toolChip: false,
      toolChipTimer: null,
      mouseDown: false,
      menuStyle: computed(() => menuStyles[props.position]),
      toolChipLeft: computed(isRight),
      toolChipRight: computed(isLeft),
      items: computed(() => isBottom() ? [...props.menuItems()].reverse() : [...props.menuItems()])
    })

    const openMenu = () => {
      state.menuOpen = true
      state.toolChip = false
      state.toolChipTimer = setTimeout(() => { state.toolChip = true }, 300)
    }

    const closeMenu = () => {
      state.menuOpen = false
      state.toolChip = false
      state.toolChipTimer = null
    }

    const onMenuClick = () => {
      if (state.menuOpen) {
        closeMenu()
      } else {
        openMenu()
      }
    }

    const onMenuSwipe = event => {
      if (!state.mouseDown) {
        return
      }
      var position = props.position
      if (event.movementX < -2) {
        if (isRight()) {
          position = position.slice(0, 1) + 'l'
        }
      } else if (event.movementX > 2) {
        if (isLeft()) {
          position = position.slice(0, 1) + 'r'
        }
      } else if (event.movementY < -2) {
        if (isBottom()) {
          position = 't' + position.slice(1)
        }
      } else if (event.movementY > 2) {
        if (isTop()) {
          position = 'b' + position.slice(1)
        }
      }
      if (position !== props.position) {
        closeMenu()
        if (props.onMenuMoved) {
          props.onMenuMoved(position)
        }
      }
    }

    return {
      state,
      onMenuClick,
      onMenuSwipe
    }
  }
}
</script>
