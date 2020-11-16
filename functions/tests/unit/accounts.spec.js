const {
  db,
  auth,
  clearDb,
  deleteApp,
  testData
} = require('./utils')
const {
  createAccount,
  setEmail,
  setPassword,
  resetUserAuth,
  rejectCreateUserWithoutAccount
} = require('../../accounts')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('createAccount()' +
  ' creates docs of accounts, users, profiles and auth entry with same id,' +
  ' and set name and default settings to user doc.', async () => {
  // prepare
  const name = 'account01'
  await db.collection('groups').doc('all').update({ members: null })

  // run
  const { id } = await createAccount({ name }, { db, auth })

  // evaluate
  const account = await db.collection('accounts').doc(id).get()
  const user = await db.collection('users').doc(id).get()
  const profile = await db.collection('profiles').doc(id).get()
  const all = await db.collection('groups').doc('all').get()
  const defaults = await db.collection('service').doc('defaults').get()
  expect(account.exists).toBeTruthy()
  expect(account.data().tz).toEqual(defaults.data().tz)
  expect(account.data().locale).toEqual(defaults.data().locale)
  expect(account.data().menuPosition).toEqual(defaults.data().menuPosition)
  expect(account.data().darkTheme).toEqual(defaults.data().darkTheme)
  expect(user.exists).toBeTruthy()
  expect(user.data().name).toEqual(name)
  expect(profile.exists).toBeTruthy()
  expect(auth.data[id]).toBeDefined()
  expect(all.data().members).toContain(id)
})

test('createAccount()' +
  ' rejects no name.', async () => {
  const name = null
  // should fail
  await expect(createAccount({ name }, { db, auth })).rejects.toThrow()
})

test('createAccount()' +
  ' throw system error.', async () => {
  // prepare
  auth.error = true
  const name = 'account01'

  // should fail
  await expect(createAccount({ name }, { db, auth })).rejects.toThrow()
})

test('setEmail()' +
  ' set email of connected account.', async () => {
  // prepare
  const id = 'account01'
  const email = 'account01@example.com'
  await db.collection('accounts').doc(id).set({ email: '' })

  // run
  const { status } = await setEmail({ id, email }, { db, auth })

  // evaluate
  const account = await db.collection('accounts').doc(id).get()
  expect(status).toEqual('ok')
  expect(account.data().email).toEqual(email)
  expect(auth.data[id].email).toEqual(email)
})

test('setEmail()' +
  ' throw system error.', async () => {
  // prepare
  const id = 'account01'
  const email = 'account01@example.com'
  await db.collection('accounts').doc(id).set({ email: '' })
  auth.error = true

  // should fail
  await expect(setEmail({ id, email }, { db, auth })).rejects.toThrow()
})

test('setPassword()' +
  ' set password of connected account.', async () => {
  // prepare
  const id = 'account01'
  const password = 'password01'
  await db.collection('accounts').doc(id).set({ email: '' })

  // run
  const { status } = await setPassword({ id, password }, { db, auth })

  // evaluate
  const account = await db.collection('accounts').doc(id).get()
  expect(status).toEqual('ok')
  expect(auth.data[id].password).toEqual(password)
})

test('setPassword()' +
  ' throw system error.', async () => {
  // prepare
  const id = 'account01'
  const password = 'password01'
  await db.collection('accounts').doc(id).set({ email: '' })
  auth.error = true

  // should fail
  await expect(setPassword({ id, password }, { db, auth })).rejects.toThrow()
})

test('resetUserAuth()' +
  ' delete user if exists and recreate user in Authentication.', async () => {
  // prepare #1
  const id = 'account01'

  // run #1
  await expect(resetUserAuth({ id }, { db, auth })).rejects.toThrow()

  // prepare $2
  await db.collection('accounts').doc(id).set({
    email: 'account01@example.com',
    line_me: 'OAuth ID: account01',
    yahoo_co_jp: 'OAuth ID: account01',
    mixi_jp: 'OAuth ID: account01'
  })

  // run #2
  await resetUserAuth({ id }, { db, auth })

  // evaluate #2
  const account1 = await db.collection('accounts').doc(id).get()
  expect(account1.data().email).toBeNull()
  expect(account1.data().line_me).toBeNull()
  expect(account1.data().yahoo_co_jp).toBeNull()
  expect(account1.data().mixi_jp).toBeNull()
  expect(auth.data[id]).toBeDefined()

  // prepare #3
  await db.collection('accounts').doc(id).set({
    email: 'account01@example.com',
    line_me: 'OAuth ID: account01',
    yahoo_co_jp: 'OAuth ID: account01',
    mixi_jp: 'OAuth ID: account01'
  })
  auth.data[id] = { email: 'account01@example.com' }

  // run #3
  await resetUserAuth({ id }, { db, auth })

  // evaluate #3
  const account2 = await db.collection('accounts').doc(id).get()
  expect(account2.data().email).toBeNull()
  expect(account1.data().line_me).toBeNull()
  expect(account1.data().yahoo_co_jp).toBeNull()
  expect(account1.data().mixi_jp).toBeNull()
  expect(auth.data[id].email).not.toBeDefined()
})

test('rejectCreateUserWithoutAccount()' +
  ' delete auth user without account doc in db.', async () => {
  // prepare
  const uid = 'account01'
  auth.data[uid] = { email: 'account01@example.com' }

  // run
  await rejectCreateUserWithoutAccount({ uid }, { db, auth })

  // evaluate
  expect(auth.data[uid]).not.toBeDefined()
})

test('rejectCreateUserWithoutAccount()' +
  ' skip to delete auth user with account doc in db.', async () => {
  // prepare
  const uid = 'account01'
  auth.data[uid] = { email: 'account01@example.com' }
  await db.collection('accounts').doc(uid).set({ email: 'account01@example.com' })

  // run
  await rejectCreateUserWithoutAccount({ uid }, { db, auth })

  // evaluate
  expect(auth.data[uid]).toBeDefined()
})
