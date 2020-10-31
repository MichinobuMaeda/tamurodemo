import Firebase from 'firebase/app'
import 'firebase/auth'
import { updateMe } from '../store'
import { updateInvitationStatus } from './invitation'

export const authProviders = store => [
  {
    id: 'google.com',
    type: 'oauth',
    name: 'Google',
    update: toggleOAuthProvider(store, 'google.com', new Firebase.auth.GoogleAuthProvider()),
    signIn: signInFirebaseAuthProvider(store, new Firebase.auth.GoogleAuthProvider())
  },
  {
    id: 'apple.com',
    type: 'oauth',
    name: 'Apple',
    update: toggleOAuthProvider(store, 'apple.com', new Firebase.auth.OAuthProvider('apple.com')),
    signIn: signInFirebaseAuthProvider(store, new Firebase.auth.OAuthProvider('apple.com'))
  },
  {
    id: 'facebook.com',
    type: 'oauth',
    name: 'Facebook',
    update: toggleOAuthProvider(store, 'facebook.com', new Firebase.auth.FacebookAuthProvider()),
    signIn: signInFirebaseAuthProvider(store, new Firebase.auth.FacebookAuthProvider())
  },
  {
    id: 'github.com',
    type: 'oauth',
    name: 'GitHub',
    update: toggleOAuthProvider(store, 'github.com', new Firebase.auth.GithubAuthProvider()),
    signIn: signInFirebaseAuthProvider(store, new Firebase.auth.GithubAuthProvider())
  },
  {
    id: 'microsoft.com',
    type: 'oauth',
    name: 'Microsoft',
    update: toggleOAuthProvider(store, 'microsoft.com', new Firebase.auth.OAuthProvider('microsoft.com')),
    signIn: signInFirebaseAuthProvider(store, new Firebase.auth.OAuthProvider('microsoft.com'))
  },
  {
    id: 'twitter.com',
    type: 'oauth',
    name: 'Twitter',
    update: toggleOAuthProvider(store, 'twitter.com', new Firebase.auth.TwitterAuthProvider()),
    signIn: signInFirebaseAuthProvider(store, new Firebase.auth.TwitterAuthProvider())
  },
  {
    id: 'line.me',
    type: 'custom',
    name: 'LINE',
    update: toggleOAuthProvider(store, 'line.me'),
    signIn: () => {}
  },
  {
    id: 'yahoo.co.jp',
    type: 'custom',
    name: 'Yahoo! Japan',
    update: toggleOAuthProvider(store, 'yahoo.co.jp'),
    signIn: () => {}
  },
  {
    id: 'mixi.jp',
    type: 'custom',
    name: 'mixi',
    update: toggleOAuthProvider(store, 'mixi.jp'),
    signIn: () => {}
  }
]

const toggleOAuthProvider = (store, id, provider = null) =>
  () => store.setProcForWait(
    async () => {
      const { state, auth, update } = store
      if (state.me && state.me[id]) {
        if (provider) {
          await auth.currentUser.unlink(id)
        } else {
          await update('accounts', state.me.id, { [id]: null })
        }
      } else {
        if (provider) {
          await auth.currentUser.linkWithRedirect(provider)
        } else {
          // TODO
        }
      }
      await updateInvitationStatus(store)
      updateMe(store)
    }
  )

const signInFirebaseAuthProvider = (store, provider) =>
  () => store.setProcForWait(
    () => store.auth.signInWithRedirect(provider)
  )
