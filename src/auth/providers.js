import Firebase from 'firebase/app'
import 'firebase/auth'
import { storeRequestedRoute } from '@/store'
import { updateInvitationStatus } from './invitation'

const oAuthProviders = {
  google: new Firebase.auth.GoogleAuthProvider(),
  facebook: new Firebase.auth.FacebookAuthProvider(),
  twitter: new Firebase.auth.TwitterAuthProvider()
}

export const authProviders = (store, route, onChange = null) => {
  const { auth, state, setProcForWait, waitForUpdate } = store

  const toggleOAuthProvider = (auth, route, id, providerId, onChange) => () => setProcForWait(
    async () => {
      if (linkedWithOAuthProvider(auth, providerId)) {
        await auth.currentUser.unlink(providerId)
      } else {
        storeRequestedRoute({ name: route.name })
        await auth.currentUser.linkWithRedirect(oAuthProviders[id])
      }
      await updateInvitationStatus(store)
      return onChange ? onChange({ id, providerId }) : null
    }
  )

  const signInFirebaseAuthProvider = id => () => setProcForWait(
    () => auth.signInWithRedirect(oAuthProviders[id])
  )

  return [
    {
      id: 'google',
      type: 'oauth',
      name: 'Google',
      update: toggleOAuthProvider(auth, route, 'google', 'google.com', onChange),
      signIn: signInFirebaseAuthProvider('google')
    },
    {
      id: 'facebook',
      type: 'oauth',
      name: 'Facebook',
      update: toggleOAuthProvider(auth, route, 'facebook', 'facebook.com', onChange),
      signIn: signInFirebaseAuthProvider('facebook')
    },
    {
      id: 'twitter',
      type: 'oauth',
      name: 'Twitter',
      update: toggleOAuthProvider(auth, route, 'twitter', 'twitter.com', onChange),
      signIn: signInFirebaseAuthProvider('twitter')
    },
    {
      id: 'line',
      type: 'custom',
      name: 'LINE',
      update: state.me && state.me.line
        ? waitForUpdate('accounts', state.me.id, { line: null })
        : () => {},
      signIn: () => {}
    },
    {
      id: 'yahooJapan',
      type: 'custom',
      name: 'Yahoo! Japan',
      update: state.me && state.me.yahooJapan
        ? waitForUpdate('accounts', state.me.id, { yahooJapan: null })
        : () => {},
      signIn: () => {}
    },
    {
      id: 'mixi',
      type: 'custom',
      name: 'mixi',
      update: state.me && state.me.mixi
        ? waitForUpdate('accounts', state.me.id, { mixi: null })
        : () => {},
      signIn: () => {}
    }
  ]
}

export const linkedWithOAuthProvider = (auth, providerId) =>
  auth.currentUser &&
  auth.currentUser.providerData &&
  auth.currentUser.providerData.some(
    item => item.providerId === providerId
  )
