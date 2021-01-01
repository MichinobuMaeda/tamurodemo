import { providers } from '../conf'
import { updateMe } from '../store'
import { updateInvitationStatus } from './invitation'

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
  () => store.setProcForWait(
    async () => {
      const key = providers.find(item => item.id === id).key
      const { state, auth, update } = store
      if (state.me && state.me[key]) {
        if (provider) {
          await auth.currentUser.unlink(id)
        }
        await update('accounts', state.me.id, { [key]: null })
      } else {
        if (provider) {
          await auth.currentUser.linkWithRedirect(provider)
          await update('accounts', state.me.id, { [key]: true })
        } else {
          await linkWithCustomProvider(store, id)
          // await update('accounts', state.me.id, { [key]: userKey })
        }
      }
      await updateInvitationStatus(store)
      updateMe(store)
    }
  )

export const signInWithFirebaseAuthProvider = (store, provider) =>
  () => store.setProcForWait(
    () => store.auth.signInWithRedirect(provider)
  )

export const signInWithCustomProvider = (store, id) =>
  () => store.setProcForWait(
    id => {}
  )

export const linkWithCustomProvider = (store, id) =>
  store.setProcForWait(
    id => {}
  )
