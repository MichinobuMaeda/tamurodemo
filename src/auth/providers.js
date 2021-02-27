import { providers } from '../conf'
import { updateMe } from '../store'
import { updateInvitationStatus } from './invitation'
import * as lineMe from './line_me'

const cunstomProviders = {
  line_me: lineMe,
  yahoo_co_jp: {},
  mixi_jp: {}
}

export const authProviders = store => providers.map(provider => ({
  ...provider,
  update: provider.instance
    ? toggleOAuthProvider(store, provider.id, provider.instance)
    : toggleOAuthProvider(store, provider.id),
  signIn: provider.instance
    ? signInWithFirebaseAuthProvider(store, provider.instance)
    : signInWithCustomProvider(store, provider.id)
}))

export const toggleOAuthProvider = (store, id, provider = null) =>
  () => store.waitFor(
    async () => {
      const key = providers.find(item => item.id === id).key
      const { state, auth, update } = store
      if (state.me && state.me[key]) {
        if (provider) {
          await auth.currentUser.unlink(id)
        }
        await update(state.me, { [key]: null })
      } else {
        if (provider) {
          await auth.currentUser.linkWithRedirect(provider)
          await update(state.me, { [key]: true })
        } else {
          await linkWithCustomProvider(store, key)
        }
      }
      await updateInvitationStatus(store)
      updateMe(store)
    }
  )

export const signInWithFirebaseAuthProvider = (store, provider) =>
  () => store.waitFor(
    () => store.auth.signInWithRedirect(provider)
  )

export const signInWithCustomProvider = (store, id) =>
  () => store.waitFor(
    () => cunstomProviders[id].sighIn(store)
  )

export const linkWithCustomProvider = (store, key) =>
  store.waitFor(
    () => cunstomProviders[key].link(store, store.state.me.id)
  )
