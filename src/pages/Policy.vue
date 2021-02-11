<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="priv.manager"
        color="primary"
        class="float-right my-0"
        v-model="edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Privacy policy')"
      >
        <template v-slot:title>{{ $t('Privacy policy') }}</template>
      </PageTitle>
      <EditableItem
        type="formatted-text"
        :label="$t('Privacy policy')"
        v-model="policy"
        :editable="edit && priv.manager"
        :disabled="!!state.waitProc"
      />
    </v-col>
  </v-row>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import { useStore } from '@/store'
import PageTitle from '@/components/PageTitle'
import EditableItem from '@/components/EditableItem'

export default {
  name: 'PagePolicy',
  components: {
    PageTitle,
    EditableItem
  },
  setup () {
    const store = useStore()
    const { state, waitFor, update } = store

    return {
      edit: ref(false),
      ...store,
      policy: computed({
        get: () => state.service.conf.policy,
        set: str => waitFor(() => update(state.service.conf, { policy: str }))
      })
    }
  }
}
</script>
