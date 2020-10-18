const {
  admin01,
  db,
  auth,
  clearDb,
  testData,
} = require('./utils')
const {
  invite,
  validateInvitation,
  setEmailWithInvitation,
  setEmailAndPasswordWithInvitation
} = require('../../auth')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await db.terminate()
})

test('invite()' +
  ' issues the invitation for the account of given id code' +
  ' and set hash of the invitation code to account doc', async () => {

  // prepare
  const id = 'account01'
  const uid = admin01
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })

  // run
  const result = await invite({ id }, { db, uid })

  // evaluate
  const account = await docRef.get()
  expect(account.data().invitedAs).toBeDefined()
  expect(account.data().invitedAt).toBeDefined()
  expect(account.data().invitedBy).toEqual(uid)
  expect(result.invitation).toBeDefined()
})

test('validateInvitation()' +
  ' get the invited accout and create a token for the account', async () => {

  // prepare
  const id = 'account01'
  const uid = admin01
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })

  // run
  const { invitation } = await invite({ id }, { db, uid })

  // evaluate
  const result = await validateInvitation({ invitation }, { db, auth })
  expect(result.token).toEqual(`token for ${id}`)
})

test('validateInvitation()' +
  ' rejects invalid invitation', async () => {

  // should fail
  await expect(
    validateInvitation({ invitation: 'invalid invitation' }, { db, auth })
  ).rejects.toThrow()
})

test('validateInvitation()' +
  ' reject expired invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = admin01
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  await docRef.update({ invitedAt: new Date(new Date().getTime() - 999999 * 1000) })

  // should fail
  await expect(
    validateInvitation({ invitation }, { db, auth })
  ).rejects.toThrow()
})

test('setEmailAndPasswordWithInvitation()' +
  ' set email and password to the account of given invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = id
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  const email = 'account01@example.com'
  const password = 'password01'

  // run
  const result = await setEmailAndPasswordWithInvitation(
    { invitation, email, password },
    { db, auth, uid }
  )

  // evaluate
  const account = await docRef.get()
  expect(result.status).toEqual('ok')
  expect(account.data().email).toEqual(email)
  expect(auth.data[id].email).toEqual(email)
  expect(auth.data[id].password).toEqual(password)
})

test('setEmailAndPasswordWithInvitation()' +
  ' rejects unmatched uid for invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = id
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  const email = 'account01@example.com'
  const password = 'password01'

  // should fail
  await expect(
    setEmailAndPasswordWithInvitation(
      { invitation, email, password },
      { db, auth, uid: 'unmatched' }
    )
  ).rejects.toThrow()
})

test('setEmailAndPasswordWithInvitation()' +
  ' rejects invalid invitation', async () => {

  // prepare
  const invitation = 'invalid invitation'
  const email = 'account01@example.com'
  const password = 'password01'

  // should fail
  await expect(
    setEmailAndPasswordWithInvitation(
      { invitation, email, password },
      { db, auth, uid: 'unmatched' }
    )
  ).rejects.toThrow()
})

test('setEmailAndPasswordWithInvitation()' +
  ' rejects expired invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = id
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  const email = 'account01@example.com'
  const password = 'password01'
  await docRef.update({ invitedAt: new Date(new Date().getTime() - 999999 * 1000) })

  // should fail
  await expect(
    setEmailAndPasswordWithInvitation(
      { invitation, email, password },
      { db, auth, uid: 'unmatched' }
    )
  ).rejects.toThrow()
})

test('setEmailWithInvitation()' +
  ' set email to the account of given invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = id
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  const email = 'account01@example.com'
  const password = 'password01'

  // run
  const result = await setEmailWithInvitation(
    { invitation, email, password },
    { db, auth, uid }
  )

  // evaluate
  const account = await docRef.get()
  expect(result.status).toEqual('ok')
  expect(account.data().email).toEqual(email)
  expect(auth.data[id].email).toEqual(email)
  expect(auth.data[id].password).toBeUndefined()
})

test('setEmailWithInvitation()' +
  ' rejects unmatched uid for invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = id
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  const email = 'account01@example.com'
  const password = 'password01'

  // should fail
  await expect(
    setEmailWithInvitation(
      { invitation, email, password },
      { db, auth, uid: 'unmatched' }
    )
  ).rejects.toThrow()
})

test('setEmailWithInvitation()' +
  ' rejects invalid invitation', async () => {

  // prepare
  const invitation = 'invalid invitation'
  const email = 'account01@example.com'
  const password = 'password01'

  // should fail
  await expect(
    setEmailWithInvitation(
      { invitation, email, password },
      { db, auth, uid: 'unmatched' }
    )
  ).rejects.toThrow()
})

test('setEmailWithInvitation()' +
  ' rejects expired invitation', async () => {

  // prepare
  const id = 'account01'
  const uid = id
  const docRef = db.collection('accounts').doc(id)
  await docRef.set({ email: '' })
  const { invitation } = await invite({ id }, { db, uid })
  const email = 'account01@example.com'
  const password = 'password01'
  await docRef.update({ invitedAt: new Date(new Date().getTime() - 999999 * 1000) })

  // should fail
  await expect(
    setEmailWithInvitation(
      { invitation, email, password },
      { db, auth, uid: 'unmatched' }
    )
  ).rejects.toThrow()
})
