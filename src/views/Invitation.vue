<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <v-switch
        v-if="!page.invitation && (priv.manager || priv.admin)"
        color="primary"
        class="float-right my-0"
        v-model="page.edit"
        :label="$t('Edit')"
      />
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Guide')"
      >
        <template v-slot:title>{{ $t('Guide') }}</template>
      </PageTitle>
      <div v-if="page.error">
        <v-alert type="error" outlined text class="mt-4">
          {{ $t('Invitation link authentication error') }}
        </v-alert>
      </div>
      <div v-else-if="!accountIsValid(state.me)">
        <v-alert type="info" outlined text class="mt-4">
          {{ $t('Please wait') }}
        </v-alert>
        <Loading color="h2" :size="96" />
      </div>
      <div v-else>
        <v-alert
          v-if="!page.invitation && (priv.manager || priv.admin)"
          type="warning" outlined
        >
          <div>{{ $t('Administrators only') }}</div>
          <div>{{ $t("Don't touch buttons except 'edit'") }}</div>
        </v-alert>
        <v-sheet
          v-if="page.edit || (state.service.conf.guide && state.service.conf.guide.data)"
          outlined rounded class="px-3 pt-3 mb-4"
        >
          <EditableItem
            type="formatted-text"
            :label="$t('Description')"
            v-model="state.service.conf.guide"
            @save="val => set('service', 'conf', { guide: val })"
            :editable="page.edit && (priv.manager || priv.admin)"
            :disabled="!!state.waitProc"
          />
        </v-sheet>
        <SelectAuthProviders />
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { reactive, computed, watch, onMounted } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { useStore } from '@/helpers'
import { validateInvitation } from '@/auth'
import PageTitle from '@/components/PageTitle'
import Loading from '@/components/Loading.vue'
import EditableItem from '@/components/EditableItem'
import SelectAuthProviders from '@/views/SelectAuthProviders'

export default {
  name: 'PageInvitation',
  components: {
    PageTitle,
    Loading,
    EditableItem,
    SelectAuthProviders
  },
  setup (props, { root }) {
    const store = useStore()
    // const { setProcForWait } = store
    const page = reactive({
      edit: false,
      email: store.state.me.email,
      validEmail: false,
      invitation: computed(() => root.$route.params.invitation || ''),
      error: ''
    })

    watch(
      () => root.$route,
      route => {
        page.invitation = route.params.invitation || ''
      }
    )

    watch(
      () => store.state.me,
      me => {
        page.email = me.email
      }
    )

    onMounted(async () => {
      if (page.invitation) {
        const result = await validateInvitation(store, page.invitation)
        if (result.status !== 'ok') {
          page.error = 'System error'
        }
      }
    })

    // const signInWithEmailLink = () => setProcForWait(
    //   async () => {
    //     await sendSignInLinkToEmail(store, page.email)
    //     page.result = { type: 'success', desc: 'Sent message' }
    //   }
    // )

    return {
      page,
      ...store,
      ...helpers
    }
  }
}
</script>
