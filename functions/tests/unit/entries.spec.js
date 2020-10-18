const path = require('path')
const firebase = require('firebase-functions-test')({
  databaseURL: 'http://localhost:8080',
  storageBucket: 'tamuro-test01.appspot.com',
  projectId: 'tamuro-test01',
}, path.join(__dirname, '..', '..', '..', 'tamuro-test01-firebase-adminsdk.json'))
const functions = require('firebase-functions')
const {
  admin01,
  db,
  auth,
  clearDb,
  testData,
} = require('./utils')
const { entries } = require('../../entries')

const {
  createAccount,
  setEmail,
  setPassword,
  invite,
  validateInvitation,
  setEmailWithInvitation,
  setEmailAndPasswordWithInvitation,
  handleUpdateServiceVersion,
  handleValidateInvitation
} = entries({ functions, db, auth })

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await db.terminate()
})

test('createAccount()' +
  ' create account of given name by uid with sufficient privilege', async () => {

  // #1 prepare
  const uid = 'account01'
  await db.collection('accounts').doc(uid).set({ valid: true })
  const wrapped = firebase.wrap(createAccount)
  const data = { name: 'name01' }
  const context = { auth: { uid }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  context.auth.uid = admin01

  // #2 run
  const { id } = await wrapped(data, context)

  // #2 evaluate
  expect(id).toBeDefined()
  const account = await db.collection('accounts').doc(id).get()
  expect(account.exists).toBeTruthy()
})

test('setEmail()' +
  ' set email to account of given id by uid with sufficient privilege', async () => {

  // #1 prepare
  const uid = 'account01'
  const id = 'account02'
  const email = 'dummy@example.com'
  await db.collection('accounts').doc(uid).set({ valid: true })
  await db.collection('accounts').doc(id).set({ valid: true })
  const wrapped = firebase.wrap(setEmail)
  const data = { id, email }
  const context = { auth: { uid }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  context.auth.uid = id

  // #2 run
  const { status } = await wrapped(data, context)

  // #2 evaluate
  expect(status).toEqual('ok')
  expect(auth.data[id].email).toEqual(email)
  const account = await db.collection('accounts').doc(id).get()
  expect(account.data().email).toEqual(email)
})

test('setPassword()' +
  ' set password to account of given id by uid with sufficient privilege', async () => {

  // #1 prepare
  const uid = 'account01'
  const id = 'account02'
  const password = 'password02'
  await db.collection('accounts').doc(uid).set({ valid: true })
  await db.collection('accounts').doc(id).set({ valid: true })
  const wrapped = firebase.wrap(setPassword)
  const data = { id, password }
  const context = { auth: { uid }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  context.auth.uid = id

  // #2 run
  const { status } = await wrapped(data, context)

  // #2 evaluate
  expect(status).toEqual('ok')
  expect(auth.data[id].password).toEqual(password)
})

test('invite()' +
  ' create invitation code for given id by uid with sufficient privilege', async () => {

  // #1 prepare
  const uid = 'account01'
  const id = 'account02'
  await db.collection('accounts').doc(uid).set({ valid: true })
  await db.collection('accounts').doc(id).set({ valid: true })
  const wrapped = firebase.wrap(invite)
  const data = { id }
  const context = { auth: { uid }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  context.auth.uid = admin01

  // #2 run
  const { invitation } = await wrapped(data, context)

  // #2 evaluate
  expect(invitation).toBeDefined()
})

test('validateInvitation()' +
  ' create token for account has valid invitation code', async () => {

  // #1 prepare
  const id = 'account01'
  await db.collection('accounts').doc(id).set({ valid: true })
  const { invitation } = await firebase.wrap(invite)({ id }, { auth: { uid: admin01 }})
  const wrapped = firebase.wrap(validateInvitation)
  const data = { invitation: 'invalid invitation' }
  const context = { auth: { uid: null }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  data.invitation = invitation

  // #2 run
  const { token } = await wrapped(data, context)

  // #2 evaluate
  expect(token).toBeDefined()
})

test('setEmailWithInvitation()' +
  ' set email to account of uid with valid invitation code', async () => {

  // #1 prepare
  const id = 'account01'
  const uid = 'account02'
  await db.collection('accounts').doc(id).set({ valid: true })
  await db.collection('accounts').doc(uid).set({ valid: true })
  const email = 'dummy@example.com'
  const { invitation } = await firebase.wrap(invite)({ id }, { auth: { uid: admin01 }})
  const wrapped = firebase.wrap(setEmailWithInvitation)
  const data = { invitation, email }
  const context = { auth: { uid }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  context.auth.uid = id

  // #2 run
  const { status } = await wrapped(data, context)

  // #2 evaluate
  expect(status).toEqual('ok')
  expect(auth.data[id].email).toEqual(email)
  const account = await db.collection('accounts').doc(id).get()
  expect(account.data().email).toEqual(email)
})

test('setEmailAndPasswordWithInvitation()' +
  ' set email and password to account of uid with valid invitation code', async () => {

  // #1 prepare
  const id = 'account01'
  const uid = 'account02'
  await db.collection('accounts').doc(id).set({ valid: true })
  await db.collection('accounts').doc(uid).set({ valid: true })
  const email = 'dummy@example.com'
  const password = 'password01'
  const { invitation } = await firebase.wrap(invite)({ id }, { auth: { uid: admin01 }})
  const wrapped = firebase.wrap(setEmailAndPasswordWithInvitation)
  const data = { invitation, email, password }
  const context = { auth: { uid }}

  // #1 should fail
  await expect(wrapped(data, context)).rejects.toThrow()

  // #2 prepare
  context.auth.uid = id

  // #2 run
  const { status } = await wrapped(data, context)

  // #2 evaluate
  expect(status).toEqual('ok')
  expect(auth.data[id].email).toEqual(email)
  expect(auth.data[id].password).toEqual(password)
  const account = await db.collection('accounts').doc(id).get()
  expect(account.data().email).toEqual(email)
})

test('handleUpdateServiceVersion()' +
  ' call updateVersion()', async () => {

  // prepare
  const result = {}
  const req = {}
  const res = {
    send (version) { result.version = version }
  }

  // run
  await handleUpdateServiceVersion(req, res)

  // evaluate
  expect(result.version).toBeDefined()
})

test('handleValidateInvitation()' +
  ' call validateInvitation()', async () => {

  // prepare
  const id = 'account01'
  await db.collection('accounts').doc(id).set({ valid: true })
  const { invitation } = await firebase.wrap(invite)({ id }, { auth: { uid: admin01 }})
  const result = {}
  const req = { params: { invitation } }
  const res = {
    send ({ token }) { result.token = token }
  }

  // run
  await handleValidateInvitation(req, res)

  // evaluate
  expect(result.token).toBeDefined()
})
