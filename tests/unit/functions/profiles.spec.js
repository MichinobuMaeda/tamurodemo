const {
  db,
  auth,
  // logger,
  clearDb,
  deleteApp,
  testData
} = require('./utils')
const {
  getProfile
} = require('../../../functions/profiles')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

const toDateAll = item => ({
  ...item,
  createdAt: item.createdAt ? item.createdAt.toDate() : null,
  updatedAt: item.updatedAt ? item.updatedAt.toDate() : null,
  hiddenAt: item.hiddenAt ? item.hiddenAt.toDate() : null,
  deletedAt: item.deletedAt ? item.deletedAt.toDate() : null
})

test('getProfile()' +
  ' get the items of the profile of given id.', async () => {
  // prepare #1
  const uid = 'account1'
  const id = 'account2'
  const ts = new Date()
  await db.collection('profiles').doc(id).set({
    createdAt: ts,
    updatedAt: ts,
    lastName_p: 'a',
    lastName: 'Last Name',
    firstName_p: 'c',
    firstName: 'First Name',
    fullName_p: 'm',
    fullName: 'Full Name',
    twitter: '@account'
  })

  // run #1
  const ret1 = await getProfile({ id }, { db, uid })

  // evaluate #1
  expect(toDateAll(ret1)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: null,
    lastName_p: 'a',
    lastName: 'Last Name'
  })

  // prepare #2
  await db.collection('profiles').doc(id).update({
    permittedUsers: []
  })

  // run #2
  const ret2 = await getProfile({ id }, { db, uid })

  // evaluate #2
  expect(toDateAll(ret2)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: null,
    lastName_p: 'a',
    lastName: 'Last Name'
  })

  // prepare #3
  await db.collection('profiles').doc(id).update({
    permittedUsers: [uid]
  })

  // run #3
  const ret3 = await getProfile({ id }, { db, uid })

  // evaluate #3
  expect(toDateAll(ret3)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: null,
    lastName_p: 'a',
    lastName: 'Last Name',
    firstName_p: 'c',
    firstName: 'First Name'
  })

  // prepare #4
  await db.collection('groups').doc('group1').set({
    name: 'Group 1',
    members: [uid]
  })
  await db.collection('profiles').doc(id).update({
    permittedUsers: [],
    permittedGroups: []
  })

  // run #4
  const ret4 = await getProfile({ id }, { db, uid })

  // evaluate #4
  expect(toDateAll(ret4)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: null,
    lastName_p: 'a',
    lastName: 'Last Name'
  })

  // prepare #5
  await db.collection('profiles').doc(id).update({
    permittedGroups: ['group1']
  })

  // run #5
  const ret5 = await getProfile({ id }, { db, uid })

  // evaluate #5
  expect(toDateAll(ret5)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: null,
    lastName_p: 'a',
    lastName: 'Last Name',
    firstName_p: 'c',
    firstName: 'First Name'
  })

  // prepare #6
  await db.collection('profiles').doc(id).update({
    permittedGroups: ['group2']
  })

  // run #6
  const ret6 = await getProfile({ id }, { db, uid })

  // evaluate #6
  expect(toDateAll(ret6)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: null,
    lastName_p: 'a',
    lastName: 'Last Name'
  })

  // prepare #7
  await db.collection('profiles').doc(id).update({
    hiddenAt: ts
  })

  // run #7
  const ret7 = await getProfile({ id }, { db, uid })

  // evaluate #7
  expect(toDateAll(ret7)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: ts,
    deletedAt: null
  })

  // prepare #8
  await db.collection('profiles').doc(id).update({
    hiddenAt: null,
    deletedAt: ts
  })

  // run #8
  const ret8 = await getProfile({ id }, { db, uid })

  // evaluate #8
  expect(toDateAll(ret8)).toEqual({
    id,
    createdAt: ts,
    updatedAt: ts,
    hiddenAt: null,
    deletedAt: ts
  })
})
