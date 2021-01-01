import {
  admin,
  auth,
  clearDb,
  deleteApp,
  // testData,
  store,
  waitRealtimeUpdate
} from '../utils'
import {
  initializeMessaging,
  ioHelpers
} from '../../../src/store/io'
import { defaults } from '../../../src/conf'

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

test('initializeMessaging()' +
  ' should set message token when the conditions are satisfied.', async () => {
  // prepare #0
  const id = 'id01'
  const vapidKey = 'web_push_certificate_key'
  await db.collection('accounts').doc(id).set({ valid: true })
  const { messaging } = store
  const param = {
    standalone: false,
    webPushCertificateKey: null,
    messaging,
    db,
    state: { me: {} }
  }

  // run #0
  await initializeMessaging(param)

  // evaluate #0
  expect(messaging.data.onMessage).not.toBeDefined()
  expect(messaging.data.getToken).not.toBeDefined()
  expect((await db.collection('accounts').doc(id).get()).data().messagingTokens || []).toHaveLength(0)

  // prepare #1
  param.standalone = true

  // run #1
  await initializeMessaging(param)

  // evaluate #1
  expect(messaging.data.getToken).not.toBeDefined()
  expect(messaging.data.onMessage).not.toBeDefined()
  expect((await db.collection('accounts').doc(id).get()).data().messagingTokens || []).toHaveLength(0)

  // prepare #2
  param.webPushCertificateKey = vapidKey

  // run #2
  await initializeMessaging(param)

  // evaluate #2
  expect(messaging.data.getToken).not.toBeDefined()
  expect(messaging.data.onMessage).not.toBeDefined()
  expect((await db.collection('accounts').doc(id).get()).data().messagingTokens || []).toHaveLength(0)

  // prepare #3

  // !!!!! CAUTION !!!!! : to be restore
  const orgEnv = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'

  // run #3
  await initializeMessaging(param)

  // evaluate #3
  expect(messaging.data.getToken).toEqual({ vapidKey })
  expect(messaging.data.onMessage).not.toThrow()
  expect((await db.collection('accounts').doc(id).get()).data().messagingTokens || []).toHaveLength(0)

  // prepare #4
  param.state.me = { id, valid: true }

  // run #4
  await initializeMessaging(param)

  // evaluate #4
  expect(messaging.data.getToken).toEqual({ vapidKey })
  expect(messaging.data.onMessage).not.toThrow()
  const myTokens4 = (await db.collection('accounts').doc(id).get()).data().messagingTokens
  expect(myTokens4).toHaveLength(1)
  expect(myTokens4[0].token).toEqual('generated token 1')
  expect(myTokens4[0].ts).toBeDefined()

  // prepare #5
  messaging.data.token = 'generated token 2'

  // run #5
  await initializeMessaging(param)

  // evaluate #5
  expect(messaging.data.getToken).toEqual({ vapidKey })
  expect(messaging.data.onMessage).not.toThrow()
  const myToken5 = (await db.collection('accounts').doc(id).get()).data().messagingTokens
  expect(myToken5).toHaveLength(2)
  expect(myToken5[0].token).toEqual('generated token 1')
  expect(myToken5[0].ts).toBeDefined()
  expect(myToken5[1].token).toEqual('generated token 2')
  expect(myToken5[1].ts).toBeDefined()

  // prepare #6

  // run #6
  await initializeMessaging(param)

  // evaluate #6
  expect(messaging.data.getToken).toEqual({ vapidKey })
  expect(messaging.data.onMessage).not.toThrow()
  const myToken6 = (await db.collection('accounts').doc(id).get()).data().messagingTokens
  expect(myToken6).toHaveLength(2)
  expect(myToken6[0].token).toEqual('generated token 1')
  expect(myToken6[0].ts).toBeDefined()
  expect(myToken6[1].token).toEqual('generated token 2')
  expect(myToken6[1].ts).toBeDefined()

  // clear
  process.env.NODE_ENV = orgEnv
})

test('ioHelpers()' +
  ' should retun the helper fuctions.', async () => {
  // prepare
  const state = {}

  // run
  const ret = ioHelpers(db, state)

  // evaluate
  expect(ret.setProcForWait).toBeInstanceOf(Function)
  expect(ret.add).toBeInstanceOf(Function)
  expect(ret.update).toBeInstanceOf(Function)
  expect(ret.remove).toBeInstanceOf(Function)
  expect(ret.restore).toBeInstanceOf(Function)
  expect(ret.waitForAdd).toBeInstanceOf(Function)
  expect(ret.waitForUpdate).toBeInstanceOf(Function)
  expect(ret.waitForRemove).toBeInstanceOf(Function)
  expect(ret.waitForRestore).toBeInstanceOf(Function)
})

test('setProcForWait()' +
  ' should set timeout and call the given function.', async () => {
  // prepare
  defaults.waitProcTimeout = 450
  const state = {}
  const counter = {
    func: 0
  }
  const func = async () => {
    await waitRealtimeUpdate(100)
    counter.func++
  }
  const { setProcForWait } = ioHelpers(db, state)

  // run #1
  const ret = setProcForWait(func)

  // evaluate #1
  expect(state.waitProc).not.toBeNull()
  expect(counter).toEqual({
    func: 0
  })

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 1
  })
})

test('setProcForWait()' +
  ' should set timeout and call the given function and the given next function.', async () => {
  // prepare
  defaults.waitProcTimeout = 450
  const state = {}
  const counter = {
    func: 0,
    next: 0
  }
  const func = async () => {
    await waitRealtimeUpdate(100)
    counter.func++
  }
  const next = () => { counter.next++ }
  const { setProcForWait } = ioHelpers(db, state)

  // run #1
  const ret = setProcForWait(func, next)

  // evaluate #1
  expect(state.waitProc).not.toBeNull()
  expect(counter).toEqual({
    func: 0,
    next: 0
  })

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 1,
    next: 1
  })
})

test('setProcForWait()' +
  ' should set timeout and call the given function and the given next function.', async () => {
  // prepare
  defaults.waitProcTimeout = 450
  const state = {}
  const counter = {
    func: 0,
    next: 0
  }
  const func = async () => {
    await waitRealtimeUpdate(750)
    counter.func++
  }
  const next = () => { counter.next++ }
  const { setProcForWait } = ioHelpers(db, state)

  // run #1
  const ret = setProcForWait(func, next)

  // evaluate #1
  expect(state.waitProc).not.toBeNull()
  expect(counter).toEqual({
    func: 0,
    next: 0
  })

  // run #2
  await waitRealtimeUpdate(500)

  // evaluate #2
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 0,
    next: 0
  })

  // run #3
  await Promise.resolve(ret)

  // evaluate #3
  expect(state.waitProc).toBeNull()
  expect(counter).toEqual({
    func: 1,
    next: 1
  })
})

test('add()' +
  ' should add the given data with the date created and the date uodated.', async () => {
  // prepare
  const state = {}
  const { add } = ioHelpers(db, state)

  // run
  await add('groups', { name: 'Group 1' })

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
  const state = {}
  const { add, update } = ioHelpers(db, state)
  await add('groups', { name: 'Group 1' })
  const id = (await db.collection('groups').get()).docs[0].id

  // run
  await update('groups', id, { name: 'Modified' })

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
  const state = {}
  const { add, remove } = ioHelpers(db, state)
  await add('groups', { name: 'Group 1' })
  const id = (await db.collection('groups').get()).docs[0].id

  // run
  await remove('groups', id)

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
  const state = {}
  const { add, remove, restore } = ioHelpers(db, state)
  await add('groups', { name: 'Group 1' })
  const id = (await db.collection('groups').get()).docs[0].id
  await remove('groups', id)

  // run
  await restore('groups', id)

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

test('waitForAdd()' +
  ' should set timeout and call add().', async () => {
  // prepare
  const state = {}
  const { waitForAdd } = ioHelpers(db, state)

  // run #1
  const ret = waitForAdd('groups', { name: 'Group 1' })

  // evaluate #1
  expect(state.waitProc).not.toBeNull()

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  expect(state.waitProc).toBeNull()
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Group 1')
})

test('waitForUpdate()' +
  ' should set timeout and call update().', async () => {
  // prepare
  const state = {}
  const { add, waitForUpdate } = ioHelpers(db, state)
  await add('groups', { name: 'Group 1' })
  const id = (await db.collection('groups').get()).docs[0].id

  // run #1
  const ret = waitForUpdate('groups', id, { name: 'Modified' })

  // evaluate #1
  expect(state.waitProc).not.toBeNull()

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Modified')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toBeLessThan(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).not.toBeDefined()
})

test('waitForRemove()' +
  ' should set timeout and call remove().', async () => {
  // prepare
  const state = {}
  const { add, waitForRemove } = ioHelpers(db, state)
  await add('groups', { name: 'Group 1' })
  const id = (await db.collection('groups').get()).docs[0].id

  // run #1
  const ret = waitForRemove('groups', id)

  // evaluate #1
  expect(state.waitProc).not.toBeNull()

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Group 1')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toEqual(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).toBeDefined()
})

test('waitForRestore()' +
  ' should set timeout and call restore().', async () => {
  // prepare
  const state = {}
  const { add, remove, waitForRestore } = ioHelpers(db, state)
  await add('groups', { name: 'Group 1' })
  const id = (await db.collection('groups').get()).docs[0].id
  await remove('groups', id)

  // run #1
  const ret = waitForRestore('groups', id, { name: 'Modified' })

  // evaluate #1
  expect(state.waitProc).not.toBeNull()

  // run #2
  await Promise.resolve(ret)

  // evaluate #2
  const groups = (await db.collection('groups').get()).docs
  expect(groups).toHaveLength(1)
  const data = groups[0].data()
  expect(data.name).toEqual('Group 1')
  expect(data.createdAt).toBeDefined()
  expect(data.updatedAt).toBeDefined()
  expect(data.createdAt.toDate().getTime()).toEqual(data.updatedAt.toDate().getTime())
  expect(data.deletedAt).toBeFalsy()
})
