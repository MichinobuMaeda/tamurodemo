<template>
  <div style="line-height: 64px;" v-if="!noaction">
    <ConfirmButton
      v-for="provider in providers" :key="provider.id"
      :type="providerEnabled(state, provider.id) ? 'warning' : 'info'"
      :color="provider.id.replace(/\./g, '_')"
      buttonClass="white--text mr-2"
      :buttonIcon="providerEnabled(state, provider.id) ? icon('Checkbox On') : icon('Checkbox Off')"
      :iconProc="providerEnabled(state, provider.id) ? icon('Confirm to remove') : icon('Confirm to add')"
      :title="$t('Sign in with provider', { provider: provider.name })"
      :message="$t((providerEnabled(state, provider.id) ? 'Remove': 'Add') + ' setting to sign in with provider', { provider: provider.name })"
      @confirm="provider.update"
      :disabled="!!state.waitProc"
    />
  </div>
  <div style="line-height: 64px;" v-else>
    <DefaultButton
      v-for="provider in providers" :key="provider.id"
      :type="providerEnabled(state, provider.id) ? 'warning' : 'info'"
      :color="provider.id.replace(/\./g, '_')"
      class="white--text mr-2"
      :icon="providerEnabled(state, provider.id) ? icon('Checkbox On') : icon('Checkbox Off')"
      :label="$t('Sign in with provider', { provider: provider.name })"
    />
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../store'
import { authProviders } from '../auth'
import ConfirmButton from '../components/ConfirmButton'
import DefaultButton from '../components/DefaultButton'

export default {
  name: 'SelectAuthProviders',
  components: {
    ConfirmButton,
    DefaultButton
  },
  props: {
    noaction: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { root, emit }) {
    const store = useStore()

    return {
      ...store,
      providerEnabled: (state, id) => state.me && state.me[id.replace(/\./g, '_')],
      providers: computed(() => authProviders(store)
        .filter(provider => store.state.service.auth && store.state.service.auth[provider.id.replace(/\./g, '_')]))
    }
  }
}
</script>
