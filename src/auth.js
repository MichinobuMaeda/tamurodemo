import Firebase from 'firebase/app'
import 'firebase/auth'
import { initUserData } from '@/store'
import {
  storeRequestedEmail, restoreRequestedEmail, eraseRequestedEmail,
  storeRequestedRoute, getById, simplifyDoc, baseUrl
} from './utils'

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

export const reauthenticate = ({ auth }, password) =>
  auth.currentUser.reauthenticateWithCredential(
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

export const setEmailAndPasswordWithInvitation = async ({ functions }, {
  invitation, newEmail, confirmEmail, newPassword, confirmPassword
}) => {
  if (newEmail && newEmail === confirmEmail) {
    if (newPassword && newPassword === confirmPassword) {
      await functions.httpsCallable('setEmailAndPasswordWithInvitation')({
        invitation,
        email: newEmail,
        password: newPassword
      })
    } else {
      await functions.httpsCallable('setEmailWithInvitation')({
        invitation,
        email: newEmail
      })
    }
  }
}

export const resetAllSignInSettings = ({ functions }, id) =>
  functions.httpsCallable('resetUserAuth')({ id })

export const validateInvitation = async ({ functions, auth }, invitation) => {
  try {
    const result = await functions.httpsCallable('validateInvitation')({ invitation })
    await auth.signInWithCustomToken(result.data.token)
  } catch (e) {
    return { status: 'error' }
  }
  return { status: 'ok' }
}

export const invitationUrl = (state, router, id) =>
  urlOfRoute(
    router,
    {
      name: 'invitation',
      params: { invitation: state.invitations[id] }
    }
  )

export const linkedWithOAuthProvider = (auth, providerId) =>
  auth.currentUser &&
  auth.currentUser.providerData &&
  auth.currentUser.providerData.some(
    item => item.providerId === providerId
  )

export const getAuthState = async ({ db, auth, state }, { root }) => {
  if (auth.isSignInWithEmailLink(window.location.href)) {
    await onSignInWithEmailLink(auth)
  } else {
    auth.onAuthStateChanged(async user => {
      if (user) {
        state.me = simplifyDoc(await db.collection('accounts').doc(user.uid).get())
      } else {
        state.loading = false
      }
    })
  }
}

const onSignInWithEmailLink = async auth => {
  const email = restoreRequestedEmail()
  eraseRequestedEmail()
  // window.localStorage.setItem('tamuroAuthMessage', '')
  if (email) {
    await auth.signInWithEmailLink(
      email,
      window.location.href
    )
  }
  window.location.href = topUrl()
}

export const signOut = async ({ auth }) => {
  await auth.signOut()
  window.location.href = signInUrl()
}

export const routePermission = (router, priv, route) => {
  return Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )
}

export const guard = (router, route, state) => {
  const priv = myPriv(state)
  if (state.loading || !route || !route.name || routePermission(router, priv, route)) {
    // to do nothing
  } else {
    const compareRoutes = (r1, r2) => r1.name === r2.name &&
      !Object.keys(r1.params || {}).some(
        key => (r1.params || {})[key] !== (r2.params || {})[key]
      )
    const target = priv.user ? { name: 'top' } : { name: 'signin' }
    if (!compareRoutes(target, route)) {
      router.push(target).catch(() => {})
    }
  }
}

export const accountIsValid = account => !!(account && account.id && !account.deletedAt && account.valid)
export const isMemberOf = (account, group) => ((group || {}).members || []).includes(account.id)
export const accountPriv = ({ service, groups }, account) => {
  const valid = accountIsValid(account)
  return {
    guest: !valid,
    invited: !!(valid &&
      account.invitedAs &&
      account.invitedAt &&
      account.invitedAt.getTime() >= (new Date().getTime() - service.conf.invitationExpirationTime)),
    user: valid,
    admin: valid && isMemberOf(account, getById(groups, 'admins')),
    manager: valid && isMemberOf(account, getById(groups, 'managers')),
    tester: valid && isMemberOf(account, getById(groups, 'testers'))
  }
}
export const myPriv = ({ service, groups, me }) => accountPriv({ service, groups }, me)

export const detectPrivilegesChanged = async (store, root, groups, groupsPrev) => {
  const hasPriv = (groups, groupId, account) => {
    return isMemberOf(account, getById(groups, groupId))
  }
  const me = store.state.me
  if (groupsPrev && groupsPrev.length && (
    hasPriv(groupsPrev, 'admins', me) !== hasPriv(groups, 'admins', me) ||
    hasPriv(groupsPrev, 'managers', me) !== hasPriv(groups, 'managers', me) ||
    hasPriv(groupsPrev, 'testers', me) !== hasPriv(groups, 'testers', me)
  )) {
    await initUserData(store, root)
  }
}

const urlOfRoute = (router, route) => baseUrl() + '#' + router.resolve(route).resolved.path
const topUrl = () => baseUrl() + '#/'
const signInUrl = () => baseUrl() + '#/signin'
