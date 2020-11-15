import {
  admin,
  clearDb,
  deleteApp,
  testData,
  setFakeWindow,
  store
} from '../utils'
import {
  reauthenticate,
  updateMyEmail,
  updateMyPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  setEmailAndPasswordWithInvitation,
  onSignInWithEmailLink
} from '../../../src/auth/email'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
  await clearDb()
  await testData()
  setFakeWindow()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('reauthenticate()' +
  ' should call "auth.currentUser.reauthenticate()"' +
  ' with given password.', async () => {
  // prepare
  const password = 'password01'
  const email = store.auth.currentUser.email

  // run
  await reauthenticate(store, password)

  // evaluate
  const cred = JSON.parse(JSON.stringify(store.auth.currentUser.data.reauthenticateWithCredential.cred))
  expect(cred.email).toEqual(email)
  expect(cred.password).toEqual(password)
  expect(cred.signInMethod).toEqual('password')
})

test('updateMyEmail()' +
  ' should call "auth.currentUser.updateMyEmail()" with given email' +
  ' and set email to account in db.', async () => {
  // prepare
  const email = 'modified@example.com'
  await admin.firestore()
    .collection('accounts')
    .doc(store.auth.currentUser.uid).set({
      email: store.auth.currentUser.email
    })

  // run
  await updateMyEmail(store, email)

  // evaluate
  expect(store.auth.currentUser.email).toEqual(email)
  const account = await admin.firestore()
    .collection('accounts')
    .doc(store.auth.currentUser.uid).get()
  expect(account.data().email).toEqual(email)
})

test('updateMyPassword()' +
  ' should call "auth.currentUser.updateMyPassword()"' +
  ' with given password.', async () => {
  // prepare
  const password = 'modified'

  // run
  await updateMyPassword(store, password)

  // evaluate
  expect(store.auth.currentUser.data.password).toEqual(password)
})

test('sendPasswordResetEmail()' +
  ' should call "auth.sendPasswordResetEmail()"' +
  ' with given email.', async () => {
  // prepare
  const email = 'test01@example.com'

  // run
  await sendPasswordResetEmail(store, email)

  // evaluate
  const data = store.auth.data.sendPasswordResetEmail
  expect(data.email).toEqual(email)
  expect(data.options.url).toEqual('http://localhost:5000/')
  expect(data.options.handleCodeInApp).toEqual(true)
})

test('sendSignInLinkToEmail()' +
  ' should call "auth.sendSignInLinkToEmail()"' +
  ' with given email.', async () => {
  // prepare
  const email = 'test01@example.com'

  // run
  await sendSignInLinkToEmail(store, email)

  // evaluate
  expect(window.localStorage.data.tamuroEmailLinkRequest).toEqual(email)
  const data = store.auth.data.sendSignInLinkToEmail
  expect(data.email).toEqual(email)
  expect(data.options.url).toEqual('http://localhost:5000/')
  expect(data.options.handleCodeInApp).toEqual(true)
})

test('signInWithEmailAndPassword()' +
  ' should call "auth.signInWithEmailAndPassword()"' +
  ' with given email and password.', async () => {
  // prepare
  const email = 'test01@example.com'
  const password = 'password01'

  // run
  await signInWithEmailAndPassword(store, email, password)

  // evaluate
  const data = store.auth.data.signInWithEmailAndPassword
  expect(data.email).toEqual(email)
  expect(data.password).toEqual(password)
})

test('setEmailAndPasswordWithInvitation()' +
  ' should call function: setEmailAndPasswordWithInvitation' +
  ' with given email and password.', async () => {
  // prepare #1
  const invitation = 'invitation01'
  const newEmail = 'test01@example.com'
  const confirmEmail = 'test01@example.com'
  const newPassword = 'password01'
  const confirmPassword = 'password01'

  // run #1
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword,
    confirmPassword
  })

  // evaluate #1
  const inputs = store.functions.inputs.setEmailAndPasswordWithInvitation
  expect(inputs.invitation).toEqual(invitation)
  expect(inputs.email).toEqual(newEmail)
  expect(inputs.password).toEqual(newPassword)
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #2
  store.functions.clear()

  // run #2
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword,
    confirmPassword: 'dummy'
  })

  // evaluate #2
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #3
  store.functions.clear()

  // run #3
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword,
    confirmPassword: ''
  })

  // evaluate #3
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #4
  store.functions.clear()

  // run #4
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword: '',
    confirmPassword
  })

  // evaluate #4
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #5
  store.functions.clear()

  // run #5
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword: '',
    confirmPassword: ''
  })

  // evaluate #5
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).toBeDefined()

  // prepare #6
  store.functions.clear()

  // run #6
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword,
    confirmPassword: null
  })

  // evaluate #6
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #7
  store.functions.clear()

  // run #7
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword: null,
    confirmPassword
  })

  // evaluate #7
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #8
  store.functions.clear()

  // run #8
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail,
    newPassword: null,
    confirmPassword: null
  })

  // evaluate #8
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).toBeDefined()

  // prepare #9
  store.functions.clear()

  // run #9
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail
  })

  // evaluate #9
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).toBeDefined()

  // prepare #10
  store.functions.clear()

  // run #10
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail: 'dummy',
    newPassword,
    confirmPassword
  })

  // evaluate #10
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #11
  store.functions.clear()

  // run #11
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail: 'dummy',
    newPassword,
    confirmPassword
  })

  // evaluate #11
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #12
  store.functions.clear()

  // run #12
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail: '',
    confirmEmail: '',
    newPassword,
    confirmPassword
  })

  // evaluate #12
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #13
  store.functions.clear()

  // run #13
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail: null,
    confirmEmail: null,
    newPassword,
    confirmPassword
  })

  // evaluate #13
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #14
  store.functions.clear()

  // run #14
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newPassword,
    confirmPassword
  })

  // evaluate #14
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()
})

test('setEmailAndPasswordWithInvitation()' +
  ' should call function: setEmailWithInvitation' +
  ' with given email.', async () => {
  // prepare #1
  const invitation = 'invitation01'
  const newEmail = 'test01@example.com'
  const confirmEmail = 'test01@example.com'

  // run #1
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail
  })

  // evaluate #1
  const inputs = store.functions.inputs.setEmailWithInvitation
  expect(inputs.invitation).toEqual(invitation)
  expect(inputs.email).toEqual(newEmail)

  // prepare #2
  store.functions.clear()

  // run #2
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail: 'dummy'
  })

  // evaluate #2
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #3
  store.functions.clear()

  // run #3
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail: '',
    confirmEmail
  })

  // evaluate #3
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #4
  store.functions.clear()

  // run #4
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail: ''
  })

  // evaluate #4
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #5
  store.functions.clear()

  // run #5
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail: '',
    confirmEmail: ''
  })

  // evaluate #5
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #6
  store.functions.clear()

  // run #6
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail: null,
    confirmEmail
  })

  // evaluate #6
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #7
  store.functions.clear()

  // run #7
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail,
    confirmEmail: null
  })

  // evaluate #7
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #8
  store.functions.clear()

  // run #8
  await setEmailAndPasswordWithInvitation(store, {
    invitation,
    newEmail: null,
    confirmEmail: null
  })

  // evaluate #8
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()

  // prepare #9
  store.functions.clear()

  // run #9
  await setEmailAndPasswordWithInvitation(store, {
    invitation
  })

  // evaluate #9
  expect(store.functions.inputs.setEmailAndPasswordWithInvitation).not.toBeDefined()
  expect(store.functions.inputs.setEmailWithInvitation).not.toBeDefined()
})

test('onSignInWithEmailLink()' +
  ' should call "auth.signInWithEmailLink()"' +
  ' with saved email.', async () => {
  // prepare #1
  const email = 'test01@example.com'
  window.localStorage.data.tamuroEmailLinkRequest = email
  const url = 'http://localhost:5000/sign/in/with/email/link'
  window.location.href = url

  // run #1
  await onSignInWithEmailLink(store.auth)

  // evaluate #1
  const data = store.auth.data.signInWithEmailLink
  expect(data.email).toEqual(email)
  expect(data.url).toEqual(url)
  expect(window.location.href).toEqual('http://localhost:5000/')
  expect(window.localStorage.data.tamuroEmailLinkRequest).toBeFalsy()

  // prepare #2
  window.localStorage.data.tamuroEmailLinkRequest = ''
  window.location.href = url
  store.auth.clear()

  // run #2
  await onSignInWithEmailLink(store.auth)

  // evaluate #2
  expect(store.auth.data.signInWithEmailLink).not.toBeDefined()
  expect(window.location.href).toEqual('http://localhost:5000/')
})
