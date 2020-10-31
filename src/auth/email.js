import Firebase from 'firebase/app'
import 'firebase/auth'
import { appId, baseUrl } from '../conf'
import { updateInvitationStatus } from './index'

const LS_REQ_EMAIL = `${appId}tamuroEmailLinkRequest`
const eraseRequestedEmail = () => window.localStorage.setItem(LS_REQ_EMAIL, '')
const storeRequestedEmail = email => window.localStorage.setItem(LS_REQ_EMAIL, email)
const restoreRequestedEmail = () => window.localStorage.getItem(LS_REQ_EMAIL)

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

export const sendPasswordResetEmail =
  ({ auth }, email) => auth.sendPasswordResetEmail(
    email,
    {
      url: baseUrl(),
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

export const signInWithEmailAndPassword =
  ({ auth }, email, password) => auth.signInWithEmailAndPassword(
    email,
    password
  )

export const setEmailAndPasswordWithInvitation = async (store, {
  invitation, newEmail, confirmEmail, newPassword, confirmPassword
}) => {
  const { functions } = store
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
  await updateInvitationStatus(store)
}

export const onSignInWithEmailLink = async auth => {
  const email = restoreRequestedEmail()
  eraseRequestedEmail()
  if (email) {
    await auth.signInWithEmailLink(
      email,
      window.location.href
    )
  }
  window.location.href = baseUrl()
}
