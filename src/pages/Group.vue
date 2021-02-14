<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        :text-color="group.deletedAt ? 'grey--text' : 'h2--text'"
        :icon-color="group.deletedAt ? 'grey' : 'h2'"
        :icon="icon(group.deletedAt ? 'Delete' : 'Group')"
      >
        <template v-slot:title>
          <EditableItem
            :label="$t('Group name')"
            v-model="name"
            :editable="priv.manager"
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
        v-if="priv.manager || (group.members || []).includes(state.me.id) || (group.desc && group.desc.data)"
        type="formatted-text"
        :label="$t('Description')"
        v-model="desc"
        :editable="priv.manager || (group.members || []).includes(state.me.id)"
        :disabled="!!state.waitProc"
      />

      <EditableItem
        type="chips"
        :label="$t('Categories')"
        :items="categoryList"
        v-model="categories"
        :editable="priv.manager"
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

      <div v-if="priv.manager">
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
import { computed } from '@vue/composition-api'
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
    const { state, icon, waitFor, update, FieldValue } = store
    const group = computed(() => findItem(store.state.groups, root.$route.params.id))

    return {
      ...store,
      group,
      name: computed({
        get: () => group.value.name,
        set: val => waitFor(() => update(group.value, { name: val }))
      }),
      desc: computed({
        get: () => group.value.desc,
        set: val => waitFor(() => update(group.value, { desc: val }))
      }),
      categoryList: computed(() => state.categories.map(item => ({
        icon: icon('Category'),
        color: 'h3',
        text: item.name,
        value: item.id
      }))),
      categories: computed({
        get: () => state.categories
          .filter(item => (item.groups || []).includes(group.value.id))
          .map(item => item.id),
        set: val => waitFor(() => Promise.all(
          state.categories.map(async c => {
            if ((val || []).includes(c.id)) {
              if (!(c.groups || []).includes(group.value.id)) {
                await update(c, {
                  groups: FieldValue.arrayUnion(group.value.id)
                })
              }
            } else {
              if ((c.groups || []).includes(group.value.id)) {
                await update(c, {
                  groups: FieldValue.arrayRemove(group.value.id)
                })
              }
            }
          })
        ))
      })
    }
  }
}
</script>
