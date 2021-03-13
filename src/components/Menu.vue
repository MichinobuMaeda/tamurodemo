<template>
  <div>
    <div
      :style="menuItemsStyles"
    >
      <div
        v-for="(item, index) in items" :key="index"
        class="text-center py-2"
      >
        <v-tooltip
          :left="state.position.slice(1) === 'r'"
          :right="state.position.slice(1) === 'l'"
          v-if="state.menuOpen"
          :value="state.toolChip"
        >
          <template v-slot:activator="{ attrs }">
            <v-btn
              v-bind="attrs"
              :dark="!$vuetify.theme.dark"
              :light="$vuetify.theme.dark"
              fab
              small
              :color="item.color || menuItemColor"
              @click="state.menuOpen = !state.menuOpen; item.action()"
            >
              <v-icon>{{ item.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ Array.isArray(item.label) ? $t(item.label[0], item.label[1]) : $t(item.label) }}</span>
        </v-tooltip>
      </div>
    </div>
    <v-btn
      v-if="state.position.slice(0, 1) !== 'a'"
      :style="menuButtonStyles"
      :dark="!$vuetify.theme.dark"
      :light="$vuetify.theme.dark"
      fab
      :color="menuColor"
      @click="onMenuClick"
      @mousedown="state.mouseDown = true"
      @mouseup="state.mouseDown = false"
      @mouseleave="state.mouseDown = false"
      @mousemove="onMenuSwipe"
      @touchstart="onToucStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @focusout="onFocusOut"
    >
      <v-icon v-if="state.menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { reactive, computed, watch } from '@vue/composition-api'

// const isTouch = () => 'ontouchstart' in window || navigator.msMaxTouchPoints

export default {
  name: 'Menu',
  props: {
    position: {
      type: String,
      default: 'br'
    },
    menuColor: {
      type: String,
      default: 'blue darken-2'
    },
    menuItemColor: {
      type: String,
      default: 'blue darken-4'
    },
    menuItems: {
      type: Function,
      default: null
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      position: props.position,
      menuOpen: false,
      toolChip: false,
      toolChipTimer: null,
      mouseDown: false,
      startX: 0,
      startY: 0
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

    const detectMove = (x, y) => {
      var changed = state.position
      if (Math.abs(x) > Math.abs(y)) {
        if (x < -2) {
          if (state.position.slice(1) === 'r') {
            changed = state.position.slice(0, 1) + 'l'
          }
        } else if (x > 2) {
          if (state.position.slice(1) === 'l') {
            changed = state.position.slice(0, 1) + 'r'
          }
        }
      } else {
        if (y < -2) {
          if (state.position.slice(0, 1) === 'b') {
            changed = 't' + state.position.slice(1)
          }
        } else if (y > 2) {
          if (state.position.slice(0, 1) === 't') {
            changed = 'b' + state.position.slice(1)
          }
        }
      }
      if (state.position !== changed) {
        closeMenu()
        state.position = changed
        emit('move', changed)
      }
    }

    const onMenuSwipe = event => {
      if (state.mouseDown) {
        detectMove(event.movementX, event.movementY)
      }
    }

    const onToucStart = event => {
      const touchObj = event.changedTouches[0]
      state.startX = touchObj.pageX
      state.startY = touchObj.pageY
      event.preventDefault()
    }

    const onTouchMove = event => {
      event.preventDefault()
    }

    const onTouchEnd = event => {
      const touchObj = event.changedTouches[0]
      detectMove((touchObj.pageX - state.startX) / 2, (touchObj.pageY - state.startY) / 2)
      event.preventDefault()
    }

    const onFocusOut = () => {
      setTimeout(closeMenu, 300)
    }

    watch(
      () => props.position,
      position => position
    )

    return {
      state,
      menuButtonStyles: computed(() => menuButtonStyles[state.position]),
      menuItemsStyles: computed(() => menuItemsStyles[state.position]),
      items: computed(() => state.position.slice(0, 1) === 'b' ? [...props.menuItems()].reverse() : [...props.menuItems()]),
      onMenuClick,
      onMenuSwipe,
      onToucStart,
      onTouchMove,
      onTouchEnd,
      onFocusOut
    }
  }
}

const menuButtonStyles = {
  tl: {
    position: 'fixed',
    'z-index': 9,
    top: '4px',
    left: '4px'
  },
  tr: {
    position: 'fixed',
    'z-index': 9,
    top: '4px',
    right: '4px'
  },
  bl: {
    position: 'fixed',
    'z-index': 9,
    bottom: '4px',
    left: '4px'
  },
  br: {
    position: 'fixed',
    'z-index': 9,
    bottom: '4px',
    right: '4px'
  }
}

const menuItemsStyles = {
  tl: {
    position: 'fixed',
    'z-index': 9,
    top: '64px',
    left: '12px'
  },
  tr: {
    position: 'fixed',
    'z-index': 9,
    top: '64px',
    right: '12px'
  },
  bl: {
    position: 'fixed',
    'z-index': 9,
    bottom: '64px',
    left: '12px'
  },
  br: {
    position: 'fixed',
    'z-index': 9,
    bottom: '64px',
    right: '12px'
  }
}
</script>
