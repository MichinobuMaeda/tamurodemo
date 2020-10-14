<template>
  <div style="line-height: 64px;">
    <ConfirmButton
      v-for="provider in providers" :key="provider.id"
      :type="page[provider.id] ? 'warning' : 'info'"
      :color="provider.id"
      buttonClass="white--text mr-2"
      :buttonIcon="page[provider.id] ? icon('Checkbox On') : icon('Checkbox Off')"
      :iconProc="page[provider.id] ? icon('Confirm to remove') : icon('Confirm to add')"
      :title="$t('Sign in with provider', { provider: provider.name })"
      :message="$t((page[provider.id] ? 'Remove': 'Add') + ' setting to sign in with provider', { provider: provider.name })"
      @confirm="provider.update"
      :disabled="!!state.waitProc"
    />
  </div>
</template>

<script>
import { reactive, computed } from '@vue/composition-api'
import * as helpers from '@/helpers'
import { useStore } from '@/helpers'
import { authProviders, linkedWithProviderId } from '@/auth'
import ConfirmButton from '@/components/ConfirmButton'

export default {
  name: 'SelectAuthProviders',
  components: {
    ConfirmButton
  },
  setup (props, { root, emit }) {
    const store = useStore()
    const { auth } = store
    const page = reactive({
      google: linkedWithProviderId(auth, 'google.com'),
      facebook: linkedWithProviderId(auth, 'facebook.com'),
      twitter: linkedWithProviderId(auth, 'twitter.com'),
      line: computed(() => store.state.me && store.state.me.line),
      yahooJapan: computed(() => store.state.me && store.state.me.yahooJapan),
      mixi: computed(() => store.state.me && store.state.me.mixi)
    })

    return {
      page,
      ...store,
      providers: authProviders(store, root.$route, ({ id, providerId }) => {
        page[id] = linkedWithProviderId(auth, providerId)
      }).filter(provider => store.state.service.auth && store.state.service.auth[provider.id]),
      ...helpers
    }
  }
}
</script>
