<template>
  <v-row>
    <v-col class="col-12">
      <CreateUser class="text-right" />

      <div
        v-for="user in state.users" :key="user.id"
        :class="user.deletedAt ? 'deleted' : ''"
      >
        <DefaultButton
          color="secondary"
          :icon="conf.icon(account(user.id).status)"
          :label="user.name"
          @click="() => goPageUser(user.id, true)"
        />
        <GroupsOfUser :id="user.id" :edit="edit" />
        <v-divider class="my-2"  />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { ref } from '@vue/composition-api'
import { useStore } from '../../store'
import DefaultButton from '../../components/DefaultButton'
import GroupsOfUser from '../../parts/GroupsOfUser'
import CreateUser from './CreateUser'

export default {
  name: 'AdminUsers',
  components: {
    DefaultButton,
    GroupsOfUser,
    CreateUser
  },
  setup () {
    const store = useStore()

    return {
      edit: ref(false),
      ...store
    }
  }
}
</script>
