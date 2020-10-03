<template>
  <v-row justify="center">
    <v-col sm="10" md="8">
      <PageTitle
        :text-color="group.deletedAt ? 'grey--text' : 'h2--text'"
        :icon-color="group.deletedAt ? 'grey' : 'h2'"
        :icon="icon(group.deletedAt ? 'Delete' : 'Group')"
      >
        <template v-slot:title>
          <EditableItem
            :label="$t('Group name')"
            v-model="group.name"
            @save="val => set('groups', group.id, { name: val })"
            :editable="state.priv.manager"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>
      <EditableItem
        type="formatted-text"
        :label="$t('Description')"
        v-model="group.desc"
        @save="val => set('groups', group.id, { desc: val })"
        :editable="state.priv.manager || (group.members || []).includes(state.me.id)"
        :disabled="!!state.waitProc"
      />

      <EditableItem
        type="chips"
        :label="$t('Categories')"
        :items="categoryList"
        v-model="categories"
        :editable="state.priv.manager"
        :disabled="!!state.waitProc"
      />

      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ icon('Members') }}</v-icon>
        {{ $t('Members') }}
      </p>

      <div v-if="state.priv.manager || state.priv.admin">
        <v-divider class="my-6" />
        <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>

        <DeleteGroup :group="group" v-if="!group.deletedAt" />
        <RestoreGroup :group="group" v-else />
      </div>

    </v-col>
  </v-row>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'
import { reactive, computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'
import DeleteGroup from '@/views/DeleteGroup'
import RestoreGroup from '@/views/RestoreGroup'

const { useStore } = helpers

export default {
  name: 'PageGroup',
  components: {
    PageTitle,
    EditableItem,
    DeleteGroup,
    RestoreGroup
  },
  setup (prop, { root }) {
    const store = useStore()
    const { db, setProcForWait } = store
    const page = reactive({})

    const getCategories = (state, groupId) => state.categories
      .filter(item => (item.groups || []).includes(groupId))
      .map(item => item.id)

    const setCategories = (db, state, groupId) => categories => setProcForWait(
      async () => Promise.all(
        state.categories.map(async c => {
          if ((categories || []).includes(c.id)) {
            if (!(c.groups || []).includes(groupId)) {
              await db.collection('categories').doc(c.id).update({
                groups: firebase.firestore.FieldValue.arrayUnion(root.$route.params.id)
              })
            }
          } else {
            if ((c.groups || []).includes(root.$route.params.id)) {
              await db.collection('categories').doc(c.id).update({
                groups: firebase.firestore.FieldValue.arrayRemove(groupId)
              })
            }
          }
        })
      )
    )

    return {
      page,
      ...store,
      rulesName: [
        v => !!v || root.$i18n.t('Required')
      ],
      group: computed(() => store.state.groups.find(
        item => item.id === root.$route.params.id)
      ),
      categoryList: computed(() => store.state.categories
        .map(item => ({ text: item.name, value: item.id }))
      ),
      categories: computed({
        get: () => getCategories(store.state, root.$route.params.id),
        set: val => setCategories(db, store.state, root.$route.params.id)(val)
      }),
      setCategories,
      ...helpers
    }
  }
}
</script>
