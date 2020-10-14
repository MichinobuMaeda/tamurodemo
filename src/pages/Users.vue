<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Users')"
      >
        <template v-slot:title>{{ $t('Users') }}</template>
      </PageTitle>
      <v-alert type="info" text dense>{{ $t('Administrators only') }}</v-alert>
      <div
        v-for="user in state.users" :key="user.id"
        :class="user.deletedAt ? 'deleted' : ''"
      >
        <DefaultButton
          color="secondary"
          :icon="icon(accountStatus(state, user.id))"
          :label="user.name"
          @click="() => goPage($router, { name: 'user', params: { id: user.id, mode: 'edit' } })"
        />
        <GroupsOfUser :id="user.id" :edit="page.edit" />
        <v-divider class="my-2"  />
      </div>

      <CreateUser />

    </v-col>
  </v-row>
</template>

<script>
import { reactive } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { useStore } from '@/helpers'
import PageTitle from '@/components/PageTitle'
import DefaultButton from '@/components/DefaultButton'
import GroupsOfUser from '@/parts/GroupsOfUser'
import CreateUser from '@/parts/CreateUser'

export default {
  name: 'PageAccounts',
  components: {
    PageTitle,
    DefaultButton,
    GroupsOfUser,
    CreateUser
  },
  setup () {
    const store = useStore()
    const page = reactive({})

    return {
      ...store,
      page,
      ...helpers
    }
  }
}
</script>
