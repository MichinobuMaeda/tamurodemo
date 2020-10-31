<template>
  <div style="line-height: 64px;">
    <ConfirmButton
      v-for="provider in providers" :key="provider.id"
      :type="(state.me && state.me[provider.id]) ? 'warning' : 'info'"
      :color="provider.id.replace(/\./g, '_')"
      buttonClass="white--text mr-2"
      :buttonIcon="(state.me && state.me[provider.id]) ? icon('Checkbox On') : icon('Checkbox Off')"
      :iconProc="(state.me && state.me[provider.id]) ? icon('Confirm to remove') : icon('Confirm to add')"
      :title="$t('Sign in with provider', { provider: provider.name })"
      :message="$t(((state.me && state.me[provider.id]) ? 'Remove': 'Add') + ' setting to sign in with provider', { provider: provider.name })"
      @confirm="provider.update"
      :disabled="!!state.waitProc"
    />
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../store'
import { authProviders } from '../auth'
import ConfirmButton from '../components/ConfirmButton'

export default {
  name: 'SelectAuthProviders',
  components: {
    ConfirmButton
  },
  setup (props, { root, emit }) {
    const store = useStore()

    return {
      ...store,
      providers: computed(() => authProviders(store)
        .filter(provider => store.state.service.auth && store.state.service.auth[provider.id]))
    }
  }
}
</script>
