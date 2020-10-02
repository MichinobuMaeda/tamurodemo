<template>
  <v-row justify="center">
    <v-col sm="10" md="8">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :title="group.name"
        :icon="icon('Group')"
      />
      <EditableItem
        type="formatted-text"
        :label="$t('Description')"
        v-model="group.desc"
        @save="val => set('groups', group.id, { desc: val })"
        :editable="priv.manager"
        :disabled="!!state.waitProc"
      />

      <p class="h3--text text-h3 pt-6">
        <v-icon color="h3">{{ icon('Members') }}</v-icon>
        {{ $t('Members') }}
      </p>

    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'

const { useStore } = helpers

export default {
  name: 'PageGroup',
  components: {
    PageTitle,
    EditableItem
  },
  setup(prop, { root }) {
    const store = useStore()
    const page = reactive({
      edit: false,
    })

    return {
      page,
      ...store,
      rulesName: [
        v => !!v || root.$i18n.t('Required')
      ],
      group: computed(() => store.state.groups.find(
        item => item.id === root.$route.params.id)
      ),
      ...helpers
    }
  }
}
</script>
