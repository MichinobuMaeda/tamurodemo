<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="priv.manager || priv.admin"
        color="primary"
        class="float-right my-0"
        v-model="edit"
        :label="$t('Edit')"
      />
      <PageTitle
        :text-color="group.deletedAt ? 'grey--text' : 'h2--text'"
        :icon-color="group.deletedAt ? 'grey' : 'h2'"
        :icon="icon(group.deletedAt ? 'Delete' : 'Group')"
      >
        <template v-slot:title>
          <EditableItem
            :label="$t('Group name')"
            v-model="group.name"
            @save="val => waitFor(() => update(group, { name: val }))"
            :editable="edit && priv.manager"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>

      <Chats
        v-if="(group.members || []).includes(state.me.id)"
        class="my-2"
        :group="group.id"
        :height="state.chatPaneHeight"
      />

      <EditableItem
        type="formatted-text"
        :label="$t('Description')"
        v-model="group.desc"
        @save="val => waitFor(() => update(group, { desc: val }))"
        :editable="edit && (priv.manager || (group.members || []).includes(state.me.id))"
        :disabled="!!state.waitProc"
      />

      <EditableItem
        type="chips"
        :label="$t('Categories')"
        :items="categoryList"
        v-model="categories"
        :editable="edit && priv.manager"
        :disabled="!!state.waitProc"
      />

      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ icon('Members') }}</v-icon>
        {{ $t('Members') }}
      </p>

      <LinkButton
        v-for="user in state.users.filter(user => !user.deletedAt && (group.members || []).includes(user.id))" :key="user.id"
        :icon="icon('User')"
        :label="user.name"
        @click="goPageUser(user.id)"
      />

      <div v-if="edit && (priv.manager || priv.admin)">
        <v-divider class="my-6" />

        <ConfirmButton
          v-if="!group.deletedAt"
          type="error"
          :title="$t('Delete item', { name: group.name })"
          :iconProc="icon('Delete')"
          :labelProc="$t('Delete')"
          :message="$t('Confirm deletion', { name: group.name })"
          @confirm="() => waitFor(() => remove(group))"
          :disabled="!!state.waitProc"
        />
        <ConfirmButton
          v-else
          type="warning"
          :title="$t('Restore item', { name: group.name })"
          :iconProc="icon('Restore')"
          :labelProc="$t('Restore')"
          :message="$t('Confirm restore', { name: group.name })"
          @confirm="() => waitFor(() => restore(group))"
          :disabled="!!state.waitProc"
        />
      </div>

    </v-col>
  </v-row>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import { useStore, findItem } from '@/store'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'
import ConfirmButton from '@/components/ConfirmButton'
import LinkButton from '@/components/LinkButton'
import Chats from '@/parts/Chats'

export default {
  name: 'PageGroup',
  components: {
    PageTitle,
    EditableItem,
    ConfirmButton,
    LinkButton,
    Chats
  },
  setup (prop, { root }) {
    const store = useStore()
    const { icon, waitFor, update, FieldValue } = store

    const getCategories = (state, id) => state.categories
      .filter(item => (item.groups || []).includes(id))
      .map(item => item.id)

    const setCategories = (state, id) => categories => waitFor(
      async () => Promise.all(
        state.categories.map(async c => {
          if ((categories || []).includes(c.id)) {
            if (!(c.groups || []).includes(id)) {
              await update(c, {
                groups: FieldValue.arrayUnion(id)
              })
            }
          } else {
            if ((c.groups || []).includes(id)) {
              await update(c, {
                groups: FieldValue.arrayRemove(id)
              })
            }
          }
        })
      )
    )

    return {
      edit: ref(false),
      ...store,
      group: computed(() => findItem(store.state.groups, root.$route.params.id)),
      categoryList: computed(() => store.state.categories
        .map(item => ({
          icon: icon('Category'),
          color: 'h3',
          text: item.name,
          value: item.id
        }))
      ),
      categories: computed({
        get: () => getCategories(store.state, root.$route.params.id),
        set: val => setCategories(store.state, root.$route.params.id)(val)
      })
    }
  }
}
</script>
