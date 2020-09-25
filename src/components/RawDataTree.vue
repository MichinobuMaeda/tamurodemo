<template>
  <v-treeview
    :items="rawTree"
    dense
  >
    <template v-slot:label="{ item }">
      <span :class="textColor">{{ item.name }}:</span> {{ item.value }}
    </template>
  </v-treeview>
</template>

<script>
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
  props: {
    textColor: {
      type: String,
      default: 'blue--text text--darken-3'
    },
    state: {
      type: Object
    }
  },
  computed: {
    rawTree () {
      return[...Object.keys(this.state || {})].sort().map(
        key => obj2RawTree('top', key, JSON.parse(JSON.stringify(this.state || {}))[key])
      )
    }
  }
}
</script>
