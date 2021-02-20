import {
  admin,
  auth,
  clearDb,
  deleteApp,
  // testData,
  store
  // waitRealtimeUpdate
} from '../utils'
import {
  castDoc,
  add,
  update,
  remove,
  restore
} from '../../../src/store/firestore'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
  auth.clear()
  await clearDb()
  // await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

const db = admin.firestore()

test('castDoc()' +
  ' should return the plain object of the given firebase document.', async () => {
  // prepare
  const id = 'test'
  const data = {
    obj1: {
      str11: 'String 11',
      dt12: new Date('2020-12-31T01:23:45.012Z'),
      obj13: {
        str131: 'String 131',
        dt132: new Date('2020-12-31T01:23:45.132Z')
      },
      arr14: [
        'String 141',
        new Date('2020-12-31T01:23:45.142Z')
      ]
    },
    arr2: [
      'String 21',
      new Date('2020-12-31T01:23:45.022Z'),
      {
        str231: 'String 231',
        dt232: new Date('2020-12-31T01:23:45.232Z')
      }
    ],
    createdAt: new Date('2020-12-31T01:23:45.001Z')
  }
  const docRef = db.collection('tests').doc(id)
  await docRef.set(data)
  const doc = await docRef.get()

  // run
  const ret = castDoc(doc)

  // evaluate
  expect(ret).toMatchObject({ id, ...data })
})

test('add()' +
  ' should add the given data with the date created and the date uodated.', async () => {
  // prepare

  // run
  await add(db.collection('groups'), { name: 'Group 1' })

  // evaluate
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Group 1')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toEqual(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).not.toBeDefined()
})

test('update()' +
  ' should update the given data with the date updated.', async () => {
  // prepare
  await add(db.collection('groups'), { name: 'Group 1' })
  const item = castDoc((await db.collection('groups').get()).docs[0])

  // run
  await update(item, { name: 'Modified' })

  // evaluate
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Modified')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toBeLessThan(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).not.toBeDefined()
})

test('remove()' +
  ' should set the date deleted to the given data.', async () => {
  // prepare
  await add(db.collection('groups'), { name: 'Group 1' })
  const item = castDoc((await db.collection('groups').get()).docs[0])

  // run
  await remove(item)

  // evaluate
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Group 1')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toEqual(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).toBeDefined()
})

test('restore()' +
  ' should reset the date deleted to the given data..', async () => {
  // prepare
  await add(db.collection('groups'), { name: 'Group 1' })
  const item = castDoc((await db.collection('groups').get()).docs[0])
  await remove(item)

  // run
  await restore(item)

  // evaluate
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Group 1')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toEqual(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).toBeFalsy()
})