import { onSignInWithEmailLink } from '@/auth/email'
import { simplifyDoc } from '@/store'

export const getAuthState = async ({ db, auth, state }) => {
  if (auth.isSignInWithEmailLink(window.location.href)) {
    await onSignInWithEmailLink(auth)
  } else {
    auth.onAuthStateChanged(async user => {
      if (user) {
        state.me = simplifyDoc(await db.collection('accounts').doc(user.uid).get())
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
