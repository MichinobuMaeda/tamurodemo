import Firebase from 'firebase/app'
import 'firebase/auth'
import { storeRequestedEmail, storeRequestedRoute, topUrl } from './helpers'

const firebaseAuthProviders = {
  google: new Firebase.auth.GoogleAuthProvider(),
  facebook: new Firebase.auth.FacebookAuthProvider(),
  twitter: new Firebase.auth.TwitterAuthProvider()
}

const updateProviderLink = (auth, route, id, providerId, next) => async () => {
  if (linkedWithProviderId(auth, providerId)) {
    await auth.currentUser.unlink(providerId)
    return next ? next({ id, providerId }) : null
  } else {
    storeRequestedRoute({ name: route.name })
    await auth.currentUser.linkWithRedirect(firebaseAuthProviders[id])
  }
}

export const authProviders = (store, route, unlinkNext = null) => {
  const { auth, state, set, setProcForWait } = store
  return [
    {
      id: 'google',
      type: 'oauth',
      name: 'Google',
      update: () => setProcForWait(
        updateProviderLink(auth, route, 'google', 'google.com', unlinkNext)
      ),
      signIn: () => setProcForWait(
        () => auth.signInWithRedirect(firebaseAuthProviders.google)
      )
    },
    {
      id: 'facebook',
      type: 'oauth',
      name: 'Facebook',
      update: () => setProcForWait(
        updateProviderLink(auth, route, 'facebook', 'facebook.com', unlinkNext)
      ),
      signIn: () => setProcForWait(
        () => auth.signInWithRedirect(firebaseAuthProviders.facebook)
      )
    },
    {
      id: 'twitter',
      type: 'oauth',
      name: 'Twitter',
      update: () => setProcForWait(
        updateProviderLink(auth, route, 'twitter', 'twitter.com', unlinkNext)
      ),
      signIn: () => setProcForWait(
        () => auth.signInWithRedirect(firebaseAuthProviders.twitter)
      )
    },
    {
      id: 'line',
      type: 'custom',
      name: 'LINE',
      update: state.me && state.me.line
        ? set('accounts', state.me.id, { line: null })
        : () => {},
      signIn: () => {}
    },
    {
      id: 'yahooJapan',
      type: 'custom',
      name: 'Yahoo! Japan',
      update: state.me && state.me.yahooJapan
        ? set('accounts', state.me.id, { yahooJapan: null })
        : () => {},
      signIn: () => {}
    },
    {
      id: 'mixi',
      type: 'custom',
      name: 'mixi',
      update: state.me && state.me.mixi
        ? set('accounts', state.me.id, { mixi: null })
        : () => {},
      signIn: () => {}
    }
  ]
}

export const reauthenticate = ({ auth }, password) => auth.currentUser.reauthenticateWithCredential(
  Firebase.auth.EmailAuthProvider.credential(
    auth.currentUser.email,
    password
  )
)

// reauthenticate is required
export const updateMyEmail = async ({ auth, set }, email) => {
  await auth.currentUser.updateEmail(email)
  await set('accounts', auth.currentUser.uid, { email })
}

// reauthenticate is required
export const updateMyPassword = async ({ auth, set }, password) => {
  await auth.currentUser.updatePassword(password)
}

export const sendPasswordResetEmail = ({ auth }, email) => auth.sendPasswordResetEmail(
  email,
  {
    url: topUrl(),
    handleCodeInApp: true
  }
)

export const sendSignInLinkToEmail = ({ auth }, email) => {
  storeRequestedEmail(email)
  return auth.sendSignInLinkToEmail(email, {
    url: window.location.href,
    handleCodeInApp: true
  })
}

export const signInWithEmailAndPassword = ({ auth }, email, password) => auth.signInWithEmailAndPassword(
  email,
  password
)

export const invite = async ({ functions, state }, id) => {
  const result = await functions.httpsCallable('invite')({ id })
  state.invitations[id] = result.data.invitation
}

export const validateInvitation = async ({ functions, auth }, invitation) => {
  try {
    const result = await functions.httpsCallable('validateInvitation')({ invitation })
    await auth.signInWithCustomToken(result.data.token)
  } catch (e) {
    return { status: 'error' }
  }
  return { status: 'ok' }
}

export const linkedWithProviderId = (auth, providerId) => auth.currentUser && auth.currentUser.providerData.some(item => item.providerId === providerId)
