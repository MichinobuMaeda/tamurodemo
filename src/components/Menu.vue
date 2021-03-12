<template>
  <div
    class="pa-2"
    :style="menuStyle"
  >
    <v-btn
      v-if="position.slice(0, 1) === 't'"
      :dark="!$vuetify.theme.dark"
      :light="$vuetify.theme.dark"
      fab
      :color="menuColor"
      @click="onMenuClick"
      @mousedown="state.mouseDown = true"
      @mouseup="state.mouseDown = false"
      @mouseleave="state.mouseDown = false"
      @mousemove="onMenuSwipe"
      @focusout="onFocusOut"
    >
      <v-icon v-if="state.menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
    <div
      v-for="(item, index) in items" :key="index"
      class="text-center py-2"
    >
      <v-tooltip
        :left="toolChipLeft"
        :right="toolChipRight"
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
    <v-btn
      v-if="position.slice(0, 1) === 'b'"
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
      @focusout="onFocusOut"
    >
      <v-icon v-if="state.menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'

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
    const isTop = () => props.position.slice(0, 1) === 't'
    const isBottom = () => props.position.slice(0, 1) === 'b'
    const isLeft = () => props.position.slice(1) === 'l'
    const isRight = () => props.position.slice(1) === 'r'

    const state = reactive({
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
      var changed = props.position
      if (Math.abs(x) > Math.abs(y)) {
        if (x < -2) {
          if (isRight()) {
            changed = props.position.slice(0, 1) + 'l'
          }
        } else if (x > 2) {
          if (isLeft()) {
            changed = props.position.slice(0, 1) + 'r'
          }
        }
      } else {
        if (y < -2) {
          if (isBottom()) {
            changed = 't' + props.position.slice(1)
          }
        } else if (y > 2) {
          if (isTop()) {
            changed = 'b' + props.position.slice(1)
          }
        }
      }
      if (props.position !== changed) {
        closeMenu()
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
      const touchObj = event.changedTouches[0]
      detectMove(touchObj.pageX - state.startX, touchObj.pageY - state.startY)
      event.preventDefault()
    }

    const onFocusOut = () => {
      setTimeout(closeMenu, 300)
    }

    return {
      state,
      menuStyle: computed(() => menuStyles[props.position]),
      toolChipLeft: computed(isRight),
      toolChipRight: computed(isLeft),
      items: computed(() => isBottom() ? [...props.menuItems()].reverse() : [...props.menuItems()]),
      onMenuClick,
      onMenuSwipe,
      onToucStart,
      onTouchMove,
      onFocusOut
    }
  }
}

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
</script>
