<template>
  <v-row>
    <v-col class="col-12">
      <div
        v-for="user in state.users" :key="user.id"
        :class="user.deletedAt ? 'deleted' : ''"
      >
        <DefaultButton
          color="secondary"
          :icon="icon(accountStatus(state, user.id))"
          :label="user.name"
          @click="() => goPageUser(user.id, true)"
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
import { useStore, accountStatus } from '../../store'
import DefaultButton from '../../components/DefaultButton'
import GroupsOfUser from '../../parts/GroupsOfUser'
import CreateUser from '../../parts/CreateUser'

export default {
  name: 'SectionUsers',
  components: {
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
      accountStatus
    }
  }
}
</script>
