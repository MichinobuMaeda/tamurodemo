<template>
  <EditableItem
    type="linked-chips"
    :label="$t('Groups')"
    :items="groupList"
    v-model="groups"
    :editable="edit && state.priv.manager"
    :disabled="!!state.waitProc"
    @click="id => goPage($router, { name: 'group', params: { id } })"
  />
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import { computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import EditableItem from '@/components/EditableItem'

const { useStore, icon } = helpers

export default {
  name: 'GroupsOfUser',
  components: {
    EditableItem
  },
  props: {
    id: String,
    edit: Boolean
  },
  setup (props, { root }) {
    const store = useStore()
    const { setProcForWait, db } = store

    const getGroups = (state, id) => state.sortedGroups
      .filter(item => (item.members || []).includes(id))
      .map(item => item.id)

    const setGroups = (db, state, id) => groups => setProcForWait(
      async () => Promise.all(
        state.groups.map(async group => {
          if ((groups || []).includes(group.id)) {
            if (!(group.members || []).includes(id)) {
              await db.collection('groups').doc(group.id).update({
                members: firebase.firestore.FieldValue.arrayUnion(id)
              })
            }
          } else {
            if ((group.members || []).includes(id)) {
              await db.collection('groups').doc(group.id).update({
                members: firebase.firestore.FieldValue.arrayRemove(id)
              })
            }
          }
        })
      )
    )

    return {
      ...store,
      groupList: computed(() => store.state.sortedGroups
        .map(item => ({
          icon: icon('Group'),
          text: item.name,
          value: item.id
        }))
      ),
      groups: computed({
        get: () => getGroups(store.state, props.id),
        set: val => setGroups(db, store.state, props.id)(val)
      }),
      ...helpers
    }
  }
}
</script>
