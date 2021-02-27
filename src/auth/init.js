import { initMe } from '../store'
import { onSignInWithEmailLink } from './email'
import {
  restoreRequestedRoute,
  eraseRequestedRoute
} from './localStrage'
import { verifyRedirectFromLineMe } from './line_me'

export const getAuthState = async ({ db, auth, state }) => {
  await verifyRedirectFromLineMe({ state })
  if (auth.isSignInWithEmailLink(window.location.href)) {
    await onSignInWithEmailLink(auth)
  } else {
    auth.onAuthStateChanged(async user => {
      if (user) {
        try {
          await initMe({ db, auth, state }, user.uid)
        } catch (e) {
          state.me = {}
          state.loading = false
          signOut({ auth })
        }
      } else {
        state.me = {}
        state.loading = false
      }
    })
  }
}

export const returnLastRoute = router => {
  const route = restoreRequestedRoute()
  eraseRequestedRoute()
  route && route.name && router.push(route).catch(() => {})
}

export const signOut = async ({ auth }) => {
  await auth.signOut()
}
