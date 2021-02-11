import Firebase from 'firebase/app'
import 'firebase/auth'
import { baseUrl } from '../conf'
import {
  storeRequestedEmail,
  restoreRequestedEmail,
  eraseRequestedEmail
} from './localStrage'
import { updateInvitationStatus } from './index'

export const reauthenticate = ({ auth }, password) =>
  auth.currentUser.reauthenticateWithCredential(
    Firebase.auth.EmailAuthProvider.credential(
      auth.currentUser.email,
      password
    )
  )

// reauthenticate is required
export const updateMyEmail = async ({ state, auth, update }, email) => {
  await auth.currentUser.updateEmail(email)
  await update(state.me, { email })
}

// reauthenticate is required
export const updateMyPassword = async ({ auth }, password) => {
  await auth.currentUser.updatePassword(password)
}

export const sendPasswordResetEmail = ({ auth }, email) =>
  auth.sendPasswordResetEmail(
    email,
    {
      url: baseUrl(),
      handleCodeInApp: true
    }
  )

export const sendSignInLinkToEmail = ({ auth }, email) => {
  storeRequestedEmail(email)
  return auth.sendSignInLinkToEmail(email, {
    url: baseUrl(),
    handleCodeInApp: true
  })
}

export const signInWithEmailAndPassword = ({ auth }, email, password) =>
  auth.signInWithEmailAndPassword(
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
    } else if (!newPassword && !confirmPassword) {
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
