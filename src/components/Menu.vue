<template>
  <div
    class="pa-2"
    :style="menuStyle"
  >
    <v-btn
      v-if="position.slice(0, 1) === 't'"
      dark
      fab
      :color="menuColor"
      @click="onMenuClick"
      @mousedown="mouseDown = true"
      @mouseup="mouseDown = false"
      @mouseleave="mouseDown = false"
      @mousemove="menuSwipe"
    >
      <v-icon v-if="menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
    <div
      v-for="(item, index) in items" :key="index"
      class="text-center py-2"
    >
      <v-tooltip
        :left="toolChipLeft"
        :right="toolChipRight"
        v-if="menuOpen"
        :value="toolChip"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            dark
            fab
            small
            :color="menuItemColor"
            @click="menuOpen = !menuOpen; item.action()"
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
      @mousedown="mouseDown = true"
      @mouseup="mouseDown = false"
      @mouseleave="mouseDown = false"
      @mousemove="menuSwipe"
    >
      <v-icon v-if="menuOpen">close</v-icon>
      <v-icon v-else>menu</v-icon>
    </v-btn>
  </div>
</template>

<script>
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
  data () {
    return  {
      menuOpen: false,
      toolChip: false,
      toolChipTimer: null,
      mouseDown: false
    }
  },
  methods: {
    openMenu () {
      this.menuOpen = true
      this.toolChip = false
      this.toolChipTimer = setTimeout(() => { this.toolChip = true }, 300)
    },
    closeMenu () {
      this.menuOpen = false
      this.toolChip = false
      this.toolChipTimer = null
    },
    onMenuClick () {
      if (this.menuOpen) {
        this.closeMenu()
      } else {
        this.openMenu()
      }
    },
    isTop () {
      return this.position.slice(0, 1) === 't'
    },
    isBottom () {
      return this.position.slice(0, 1) === 'b'
    },
    isLeft () {
      return this.position.slice(1) === 'l'
    },
    isRight () {
      return this.position.slice(1) === 'r'
    },
    menuSwipe (event) {
      if (!this.mouseDown) {
        return
      }
      var position = this.position
      if (event.movementX < -2) {
        if (this.isRight()) {
          position = position.slice(0, 1) + 'l'
        }
      } else if (event.movementX > 2) {
        if (this.isLeft()) {
          position = position.slice(0, 1) + 'r'
        }
      } else if (event.movementY < -2) {
        if (this.isBottom()) {
          position = 't' + position.slice(1)
        }
      } else if (event.movementY > 2) {
        if (this.isTop()) {
          position = 'b' + position.slice(1)
        }
      }
      if (position !== this.position) {
        this.closeMenu()
        if (this.onMenuMoved) {
          this.onMenuMoved(position)
        }
      }
    }
  },
  computed: {
    menuStyle () {
      return menuStyles[this.position]
    },
    toolChipLeft () {
      return this.isRight()
    },
    toolChipRight () {
      return this.isLeft()
    },
    items () {
      const items = this.menuItems()
      if (this.isBottom()) {
        items.reverse()
      }
      return items
    }
  }
}
</script>
