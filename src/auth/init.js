import { initMe } from '../store'
import { onSignInWithEmailLink } from './email'

export const getAuthState = async ({ db, auth, state }) => {
  if (auth.isSignInWithEmailLink(window.location.href)) {
    await onSignInWithEmailLink(auth)
  } else {
    auth.onAuthStateChanged(async user => {
      if (user) {
        await initMe({ db, auth, state }, user.uid)
      } else {
        state.me = {}
        state.loading = false
      }
    })
  }
}

export const signOut = async ({ auth }) => {
  await auth.signOut()
}
