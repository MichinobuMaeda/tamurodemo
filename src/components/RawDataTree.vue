<template>
  <v-dialog v-model="state.dialog" scrollable max-width="1024px">
    <v-card>
      <v-card-title>
          <span :class="titleColor + ' text-h5'">
            <v-icon large :color="iconColor">{{ icon }}</v-icon>
            {{ title }}
          </span>
        <v-spacer />
        <v-btn icon @click="$emit('dialogChange', false)">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />
      <v-card-text style="height: 640px;">
        <v-treeview
          :items="state.items"
          dense
        >
          <template v-slot:label="{ item }">
            <span :class="textColor">{{ item.name }}:</span> {{ item.value }}
          </template>
        </v-treeview>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'

const obj2RawTree = (parent, key, val) => typeof val === 'undefined'
  ? {
    id: `${parent}_${key}`,
    name: key,
    value: 'undefined'
  }
  : typeof val === 'function'
    ? {
      id: `${parent}_${key}`,
      name: key,
      value: 'function () {...}'
    }
    : typeof val === 'symbol'
      ? {
        id: `${parent}_${key}`,
        name: key,
        value: val.toString()
      }
      : (
        typeof val === 'boolean' ||
        typeof val === 'number' ||
        typeof val === 'bigint' ||
        typeof val === 'string' ||
        !val
      ) ? {
          id: `${parent}_${key}`,
          name: key,
          value: JSON.stringify(val)
        }
        : Array.isArray(val)
          ? val.length
            ? {
              id: `${parent}_${key}`,
              name: key,
              value: `[ ${val.length} ]`,
              children: val.map((item, index) => obj2RawTree(
                `${parent}_${key}`,
                (item && item.id) ? item.id : index,
                item)
              )
            }
            : {
              id: `${parent}_${key}`,
              name: key,
              value: '[ ]'
            }
          : Object.keys(val).length
            ? {
              id: `${parent}_${key}`,
              name: key,
              value: '{...}',
              children: [...Object.keys(val).filter(item => item !== 'id' || val[item] !== key)].sort().map(
                item => obj2RawTree(
                  `${parent}_${key}`,
                  item,
                  val[item]
                )
              )
            }
            : {
              id: `${parent}_${key}`,
              name: key,
              value: '{ }'
            }

export default {
  name: 'RawDataTree',
  model: {
    prop: 'dialog',
    event: 'dialogChange'
  },
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    items: Object,
    icon: String,
    title: String,
    iconColor: {
      type: String,
      default: 'blue darken-3'
    },
    titleColor: {
      type: String,
      default: 'blue--text text--darken-3'
    },
    textColor: {
      type: String,
      default: 'blue--text text--darken-3'
    }
  },
  setup(props) {
    const state = reactive({
      dialog: computed(() => props.dialog),
      items: computed(() => [...Object.keys(props.items || {})].sort().map(
        key => obj2RawTree('top', key, JSON.parse(JSON.stringify(props.items || {}))[key])
      ))
    })
    return {
      state
    }
  }
}
</script>
