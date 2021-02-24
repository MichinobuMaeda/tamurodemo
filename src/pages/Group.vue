<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        :text-color="group.deletedAt ? 'grey--text' : 'h2--text'"
        :icon-color="group.deletedAt ? 'grey' : 'h2'"
        :icon="conf.icon(group.deletedAt ? 'Delete' : 'Group')"
      >
        <template v-slot:title>
          <TextEditor
            v-model="name"
            :label="$t('Group name')"
            :editable="me.priv.manager"
            :disabled="!!state.waitProc"
          />
        </template>
      </PageTitle>

      <Chats
        v-if="(group.members || []).includes(me.id)"
        class="my-2"
        :groupId="group.id"
        :height="state.chatPaneHeight"
      />

      <FormattedTextEditor
        :placeholder="$t('Introduction of the group')"
        v-model="desc"
        :editable="me.priv.manager || (group.members || []).includes(me.id)"
        :disabled="!!state.waitProc"
      />

      <EditableItem
        type="chips"
        :label="$t('Categories')"
        :items="categoryList"
        v-model="categories"
        :editable="me.priv.manager"
        :disabled="!!state.waitProc"
      />

      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ conf.icon('Members') }}</v-icon>
        {{ $t('Members') }}
      </p>

      <LinkButton
        v-for="user in state.users.filter(user => (me.priv.mamanger || me.priv.admin || !(account(user.id)).deletedAt) && (group.members || []).includes(user.id))" :key="user.id"
        :icon="conf.icon('User')"
        :label="user.name"
        @click="goPageUser(user.id)"
      />

      <v-card v-if="me.priv.manager" class="mt-4">
        <v-card-title class="pa-0">
          <v-alert type="info" text dense width="100%">{{ $t('Administrators only') }}</v-alert>
        </v-card-title>
        <v-card-text>
          <ConfirmButton
            v-if="!group.deletedAt"
            type="error"
            :title="$t('Delete item', { name: group.name })"
            :iconProc="conf.icon('Delete')"
            :labelProc="$t('Delete')"
            :message="$t('Confirm deletion', { name: group.name })"
            @confirm="() => waitFor(() => remove(group))"
            :disabled="!!state.waitProc"
          />
          <ConfirmButton
            v-else
            type="warning"
            :title="$t('Restore item', { name: group.name })"
            :iconProc="conf.icon('Restore')"
            :labelProc="$t('Restore')"
            :message="$t('Confirm restore', { name: group.name })"
            @confirm="() => waitFor(() => restore(group))"
            :disabled="!!state.waitProc"
          />
        </v-card-text>
      </v-card>

    </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '@/store'
import PageTitle from '@/components/PageTitle'
import TextEditor from '@/components/TextEditor'
import FormattedTextEditor from '@/components/FormattedTextEditor'
import EditableItem from '@/components/EditableItem'
import ConfirmButton from '@/components/ConfirmButton'
import LinkButton from '@/components/LinkButton'
import Chats from '@/parts/Chats'

export default {
  name: 'PageGroup',
  components: {
    PageTitle,
    TextEditor,
    FormattedTextEditor,
    EditableItem,
    ConfirmButton,
    LinkButton,
    Chats
  },
  setup () {
    const store = useStore()
    const { state, conf, waitFor, update, FieldValue } = store

    const group = computed(() => store.group(state.route.params && state.route.params.id))

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
        icon: conf.icon('Category'),
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
