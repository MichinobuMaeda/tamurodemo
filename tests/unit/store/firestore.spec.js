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
  // prepare #1

  // run #1
  await add(db.collection('groups'), { name: 'Group 1' })

  // evaluate #1
  const groups1 = (await db.collection('groups').get()).docs
  expect(groups1).toHaveLength(1)
  const data1 = groups1[0].data()
  expect(data1.name).toEqual('Group 1')
  expect(data1.createdAt.toDate().getTime()).toBeGreaterThan(new Date('2000-01-01T00:00:00.000Z').getTime())
  expect(data1.updatedAt.toDate().getTime()).toEqual(data1.createdAt.toDate().getTime())
  expect(data1.deletedAt).not.toBeDefined()

  // prepare #2
  const ts = new Date('2000-01-01T00:00:00.000Z')

  // run #2
  await add(db.collection('groups'), { name: 'Group 2' }, ts)

  // evaluate #2
  const groups2 = (await db.collection('groups').get()).docs
  expect(groups2).toHaveLength(2)
  const data2 = groups2.find(doc => doc.data().name === 'Group 2').data()
  expect(data2.name).toEqual('Group 2')
  expect(data2.createdAt.toDate().getTime()).toEqual(ts.getTime())
  expect(data2.createdAt.toDate().getTime()).toEqual(data2.updatedAt.toDate().getTime())
  expect(data2.deletedAt).not.toBeDefined()
})

test('update()' +
  ' should update the given data with the date updated.', async () => {
  // prepare #1
  await add(db.collection('groups'), { name: 'Group 1' })
  const item = castDoc((await db.collection('groups').get()).docs[0])

  // run #1
  await update(item, { name: 'Modified' })

  // evaluate #1
  const groups1 = (await db.collection('groups').get()).docs
  expect(groups1).toHaveLength(1)
  const data1 = groups1[0].data()
  expect(data1.name).toEqual('Modified')
  expect(data1.createdAt.toDate().getTime()).toBeGreaterThan(new Date('2000-01-01T00:00:00.000Z').getTime())
  expect(data1.updatedAt.toDate().getTime()).toBeGreaterThan(data1.createdAt.toDate().getTime())
  expect(data1.deletedAt).not.toBeDefined()

  // prepare #2
  const ts = new Date('2000-01-01T00:00:00.000Z')

  // run #2
  await update(item, { name: 'Modified' }, ts)

  // evaluate #1
  const groups2 = (await db.collection('groups').get()).docs
  expect(groups2).toHaveLength(1)
  const data2 = groups2[0].data()
  expect(data2.name).toEqual('Modified')
  expect(data2.createdAt.toDate().getTime()).toBeGreaterThan(new Date('2000-01-01T00:00:00.000Z').getTime())
  expect(data2.updatedAt.toDate().getTime()).toEqual(ts.getTime())
  expect(data2.deletedAt).not.toBeDefined()
})

test('remove()' +
  ' should set the date deleted to the given data.', async () => {
  // prepare #1
  await add(db.collection('groups'), { name: 'Group 1' })
  const item = castDoc((await db.collection('groups').get()).docs[0])

  // run #1
  await remove(item)

  // evaluate #1
  const groups1 = (await db.collection('groups').get()).docs
  expect(groups1).toHaveLength(1)
  const data1 = groups1[0].data()
  expect(data1.name).toEqual('Group 1')
  expect(data1.createdAt).toBeDefined()
  expect(data1.updatedAt.toDate().getTime()).toEqual(data1.createdAt.toDate().getTime())
  expect(data1.deletedAt.toDate().getTime()).toBeGreaterThan(data1.createdAt.toDate().getTime())

  // prepare #2
  const ts = new Date('2000-01-01T00:00:00.000Z')
  await restore(item)

  // run #2
  await remove(item, ts)

  // evaluate #2
  const groups2 = (await db.collection('groups').get()).docs
  expect(groups2).toHaveLength(1)
  const data2 = groups2[0].data()
  expect(data2.name).toEqual('Group 1')
  expect(data2.createdAt).toBeDefined()
  expect(data2.updatedAt.toDate().getTime()).toBeGreaterThan(data2.createdAt.toDate().getTime())
  expect(data2.deletedAt.toDate().getTime()).toEqual(ts.getTime())
})

test('restore()' +
  ' should reset the date deleted to the given data..', async () => {
  // prepare #1
  await add(db.collection('groups'), { name: 'Group 1' })
  const item = castDoc((await db.collection('groups').get()).docs[0])
  await remove(item)

  // run #1
  await restore(item)

  // evaluate #1
  const groups1 = (await db.collection('groups').get()).docs
  expect(groups1).toHaveLength(1)
  const data1 = groups1[0].data()
  expect(data1.name).toEqual('Group 1')
  expect(data1.createdAt).toBeDefined()
  expect(data1.updatedAt.toDate().getTime()).toBeGreaterThan(data1.createdAt.toDate().getTime())
  expect(data1.deletedAt).toBeFalsy()

  // prepare #2
  const ts = new Date('2000-01-01T00:00:00.000Z')
  await remove(item)

  // run #2
  await restore(item, ts)

  // evaluate #2
  const groups2 = (await db.collection('groups').get()).docs
  expect(groups2).toHaveLength(1)
  const data2 = groups2[0].data()
  expect(data2.name).toEqual('Group 1')
  expect(data2.createdAt).toBeDefined()
  expect(data2.updatedAt.toDate().getTime()).toEqual(ts.getTime())
  expect(data2.deletedAt).toBeFalsy()
})
