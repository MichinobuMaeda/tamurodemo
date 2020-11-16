const {
  db,
  auth,
  clearDb,
  deleteApp,
  testData
} = require('./utils')
const {
  guardValidAccount,
  guardGroups,
  guardUserSelfOrGroups
} = require('../../guards')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('guardValidAccount()' +
  ' accepts uid of valid account.', async () => {
  // prepare
  const callMe = { data: null, context: null }
  const uid = 'account01'
  await db.collection('accounts').doc(uid).set({
    valid: true
  })
  const data = { test: 'test01' }
  const context = { db, uid }
  const next = (data, context) => {
    callMe.data = data
    callMe.context = context
  }

  // run
  await guardValidAccount(data, context, next)

  // evaluate
  expect(callMe.data.test).toEqual(data.test)
  expect(callMe.context.uid).toEqual(uid)
})

test('guardValidAccount()' +
  ' rejects no uid.', async () => {
  // prepare
  const uid = 'account01'
  await db.collection('accounts').doc(uid).set({
    valid: false
  })
  const data = { test: 'test01' }
  const context = { db }
  const next = (data, context) => { throw new Error("Don't call me") }

  // should fail
  await expect(guardValidAccount(data, context, next)).rejects.toThrow()
})

test('guardValidAccount()' +
  ' rejects uid of invalid account.', async () => {
  // prepare
  const uid = 'account01'
  await db.collection('accounts').doc(uid).set({
    valid: false
  })
  const data = { test: 'test01' }
  const context = { db, uid }
  const next = (data, context) => { throw new Error("Don't call me") }

  // should fail
  await expect(guardValidAccount(data, context, next)).rejects.toThrow()
})

test('guardValidAccount()' +
  ' rejects uid of deleted account.', async () => {
  // prepare
  const uid = 'account01'
  await db.collection('accounts').doc(uid).set({
    valid: true,
    deletedAt: new Date()
  })
  const data = { test: 'test01' }
  const context = { db, uid }
  const next = (data, context) => { throw new Error("Don't call me") }

  // should fail
  await expect(guardValidAccount(data, context, next)).rejects.toThrow()
})

test('guardValidAccount()' +
  ' rejects uid of account not exist.', async () => {
  // prepare
  const uid = 'account01'
  const data = { test: 'test01' }
  const context = { db, uid }
  const next = (data, context) => { throw new Error("Don't call me") }

  // should fail
  await expect(guardValidAccount(data, context, next)).rejects.toThrow()
})

test('guardGroups()' +
  ' accepts uid of valid account' +
  ' that belongs to one of the specified groups,' +
  ' and rejects that not belongs to any of the specified groups.' +
  ' and rejects invalid account,' +
  ' and accepts uid equals data.id.', async () => {
  // #1 prepare
  const callMe = { data: null, context: null }
  const uid = 'account01'
  const managersOrAdmins = ['managers', 'admins']
  const managersRef = db.collection('groups').doc(managersOrAdmins[0])
  const adminsRef = db.collection('groups').doc(managersOrAdmins[1])
  const accountRef = db.collection('accounts').doc(uid)
  await accountRef.set({
    valid: true
  })
  const managerMembers = ['admin01']
  await managersRef.update({
    members: [...managerMembers, uid]
  })
  const data = { test: 'test01' }
  const context = { db, uid }
  const next = (data, context) => {
    callMe.data = data
    callMe.context = context
  }

  // #1 run
  await guardGroups(data, context, managersOrAdmins, next)

  // #1 evaluate
  expect(callMe.data.test).toEqual(data.test)
  expect(callMe.context.uid).toEqual(uid)

  // #2 prepare
  await managersRef.update({
    members: managerMembers
  })

  // #2 should fail
  await expect(
    guardGroups(data, context, managersOrAdmins, next)
  ).rejects.toThrow()

  // #3 prepare
  await managersRef.update({
    members: [...managerMembers, uid]
  })
  callMe.data.test = null
  callMe.data.context = null

  // #3 run
  await guardGroups(data, context, managersOrAdmins, next)

  // #3 evaluate
  expect(callMe.data.test).toEqual(data.test)
  expect(callMe.context.uid).toEqual(uid)

  // #4 prepare
  await managersRef.update({
    members: managerMembers
  })
  await adminsRef.update({
    deletedAt: new Date()
  })

  // #4 should fail
  await expect(
    guardGroups(data, context, managersOrAdmins, next)
  ).rejects.toThrow()

  // #5 prepare
  await adminsRef.update({
    deletedAt: null
  })
  await accountRef.set({
    valid: false
  })

  // #5 should fail
  await expect(
    guardGroups(data, context, managersOrAdmins, next)
  ).rejects.toThrow()
})

test('guardUserSelfOrGroups()' +
  ' accepts uid of valid account' +
  ' that belongs to one of the specified groups,' +
  ' and rejects that not belongs to any of the specified groups.' +
  ' and rejects invalid account.', async () => {
  // #1 prepare
  const callMe = { data: null, context: null }
  const uid = 'account01'
  const managersOrAdmins = ['managers', 'admins']
  const managersRef = db.collection('groups').doc(managersOrAdmins[0])
  const adminsRef = db.collection('groups').doc(managersOrAdmins[1])
  const accountRef = db.collection('accounts').doc(uid)
  await accountRef.set({
    valid: true
  })
  const managerMembers = ['admin01']
  await managersRef.update({
    members: [...managerMembers, uid]
  })
  const data = { test: 'test01', id: 'account02' }
  const context = { db, uid }
  const next = (data, context) => {
    callMe.data = data
    callMe.context = context
  }

  // #1 run
  await guardUserSelfOrGroups(data, context, managersOrAdmins, next)

  // #1 evaluate
  expect(callMe.data.test).toEqual(data.test)
  expect(callMe.context.uid).toEqual(uid)

  // #2 prepare
  await managersRef.update({
    members: managerMembers
  })

  // #2 should fail
  await expect(
    guardUserSelfOrGroups(data, context, managersOrAdmins, next)
  ).rejects.toThrow()

  // #3 prepare
  await managersRef.update({
    members: [...managerMembers, uid]
  })
  callMe.data.test = null
  callMe.data.context = null

  // #3 run
  await guardUserSelfOrGroups(data, context, managersOrAdmins, next)

  // #3 evaluate
  expect(callMe.data.test).toEqual(data.test)
  expect(callMe.context.uid).toEqual(uid)

  // #4 prepare
  await managersRef.update({
    members: managerMembers
  })
  await adminsRef.update({
    deletedAt: new Date()
  })

  // #4 should fail
  await expect(
    guardUserSelfOrGroups(data, context, managersOrAdmins, next)
  ).rejects.toThrow()

  // #5 prepare
  await adminsRef.update({
    deletedAt: null
  })
  data.id = uid

  // #5 run
  await guardUserSelfOrGroups(data, context, managersOrAdmins, next)

  // #5 evaluate
  expect(callMe.data.test).toEqual(data.test)
  expect(callMe.context.uid).toEqual(uid)

  // #6 prepare
  await accountRef.set({
    valid: false
  })

  // #6 should fail
  await expect(
    guardUserSelfOrGroups(data, context, managersOrAdmins, next)
  ).rejects.toThrow()
})
