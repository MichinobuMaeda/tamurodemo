<template>
  <EditableItem
    type="linked-chips"
    :label="$t('Groups')"
    :items="groupList"
    v-model="groups"
    :editable="edit && priv.manager"
    :disabled="!!state.waitProc"
    @click="id => goPage($router, { name: 'group', params: { id } })"
  />
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore, sortedGroups } from '@/store'
import EditableItem from '@/components/EditableItem'

export default {
  name: 'GroupsOfUser',
  components: {
    EditableItem
  },
  props: {
    id: String,
    edit: Boolean
  },
  setup (props) {
    const store = useStore()
    const { icon } = store
    const { waitFor, update, FieldValue } = store

    const getGroups = (state, id) => sortedGroups(state)
      .filter(item => (item.members || []).includes(id))
      .map(item => item.id)

    const setGroups = (state, id) => groups => waitFor(
      async () => Promise.all(
        state.groups.map(async group => {
          if ((groups || []).includes(group.id)) {
            if (!(group.members || []).includes(id)) {
              await update(group, {
                members: FieldValue.arrayUnion(id)
              })
            }
          } else {
            if ((group.members || []).includes(id)) {
              await update(group, {
                members: FieldValue.arrayRemove(id)
              })
            }
          }
        })
      )
    )

    return {
      ...store,
      groupList: computed(() => sortedGroups(store.state)
        .map(item => ({
          icon: icon('Group'),
          text: item.name,
          value: item.id
        }))
      ),
      groups: computed({
        get: () => getGroups(store.state, props.id),
        set: val => setGroups(store.state, props.id)(val)
      })
    }
  }
}
</script>
