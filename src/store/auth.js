import { auth, db } from '../plugins/firebase'
import { clearUserData, initUserData } from './init'
import { simplifyDoc, getById } from "./utils";

const topUrl = () => window.location.href
  .replace(/\?.*/, '')
  .replace(/#.*/, '#/')
const signInUrl = () => window.location.href
  .replace(/\?.*/, '')
  .replace(/#.*/, '#/signin')

export const clearAuth = state => {
  state.me = {}
  state.credential = {}
  state.unsubscribers = {}
  state.confirmSginOut = false
  state.authMessage = ''
  state.showPassword = false
}

export const isValid = state => state.me && state.me.valid
export const isMemberOf = (state, groupId) => isValid(state) &&
  (state.groups || []).some(
    group => group.id === groupId && group.members.includes(state.me.id)
  )
export const isAdmin = state => isMemberOf(state, 'admins')
export const isManager = state => isMemberOf(state, 'managers')
export const isTester = state => isMemberOf(state, 'testers')
export const myPriv = state => ({
  guest: !isValid(state),
  user: isValid(state),
  admin: isAdmin(state),
  manager: isManager(state),
  tester: isTester(state)
})
export const myName = state => getById(state.users, state.me.id).name || 'Guest'

export const signOut = async state => {
  await auth.signOut()
  state.confirmSginOut = false
  window.location.href = signInUrl()
}

const onSignIn = async (state, me) => {
  state.authMessage = ''
  window.localStorage.setItem('tamuroAuthMessage', '')
  state.me = simplifyDoc(me)
  await initUserData(state)
}

const onSignOut = state => {
  clearUserData(state)
}

const validateEmailLink = async () => {
  const email = window.localStorage.getItem('tamuroEmailLinkRequest')
  window.localStorage.setItem('tamuroEmailLinkRequest', '')
  window.localStorage.setItem('tamuroAuthMessage', '')
  if (email) {
    await auth.signInWithEmailLink(
      email,
      window.location.href
    )
  }
  window.location.href = topUrl()
}

export const checkAuthStatus = async (state) => {
  state.authMessage = window.localStorage.getItem('tamuroAuthMessage') || ''
  auth.onAuthStateChanged(async user => {
    if (auth.isSignInWithEmailLink(window.location.href)) {
      await validateEmailLink(user)
    } else if (user) {
      const me = await db.collection('accounts').doc(user.uid).get()
      if (me && me.exists && me.data().valid) {
        await onSignIn(state, me)
      } else {
        await signOut()
      }
    } else {
      onSignOut(state)
    }
    setTimeout(() => { state.loading = false }, 500)
  })
}

export const signInWithEmailLink = async state => {
  await auth.sendSignInLinkToEmail(state.credential.email, {
    url: window.location.href,
    handleCodeInApp: true
  })
  window.localStorage.setItem('tamuroEmailLinkRequest', state.credential.email)
  state.authMessage = 'Sent message'
}

export const signInWithPassword = async state => {
  try {
    await auth.signInWithEmailAndPassword(
      state.credential.email,
      state.credential.password
    )
  } catch (e) {
    state.authMessage = 'Invalid email or password'
  }
}

export const resetPassword = async state => {
  console.info('resetPassword')
  await auth.sendPasswordResetEmail(
    state.me.id ? state.me.email : state.credential.email,
    {
      url: topUrl(),
      handleCodeInApp: true
    }
  )
  state.authMessage = 'Sent message'
  window.localStorage.setItem('tamuroAuthMessage', '')
}
