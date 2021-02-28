import {
  admin,
  auth,
  clearDb,
  deleteApp,
  testData,
  store,
  waitRealtimeUpdate
} from '../_testUtils'
import {
  clearServiceData,
  unsubscribeAll,
  clearUserData,
  initServiceData,
  updateMe,
  initMe,
  initUserData,
  getInitialAndRealtimeData,
  findItem
} from '../../../src/store/state'

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

test('clearServiceData()' +
  ' should return empty state.service:.', async () => {
  // prepare #0

  // run #0
  const ret0 = clearServiceData()

  // evaluate #0
  expect(ret0).toEqual({ service: {} })

  // prepare #1
  const state1 = { other: 'test', service: { conf: {} } }

  // run #1
  const ret1 = clearServiceData(state1)

  // evaluate #1
  expect(ret1).toEqual({ other: 'test', service: {} })
})

test('unsubscribeAll()' +
  ' should .', async () => {
  // prepare
  const counter = {
    unsub1: 0,
    unsub2: 0
  }
  const state0 = {
    tests: ['abc']
  }
  const state1 = {
    ...state0,
    unsubscribers: {
      unsub1: () => { counter.unsub1++ },
      unsub2: () => { counter.unsub2++ }
    }
  }

  // run #0
  unsubscribeAll(state0)

  // evaluate #0
  expect(state0).toEqual({ tests: ['abc'], unsubscribers: {} })
  expect(counter.unsub1).toEqual(0)
  expect(counter.unsub2).toEqual(0)

  // run #1
  unsubscribeAll(state1)

  // evaluate #1
  expect(state1).toEqual({ tests: ['abc'], unsubscribers: {} })
  expect(counter.unsub1).toEqual(1)
  expect(counter.unsub2).toEqual(1)
})

test('clearUserData()' +
  ' should erase user data.', async () => {
  // prepare
  const state = {
    service: { conf: {} },
    me: { id: 'id00' }
  }

  // run
  const ret = clearUserData(state)

  // evaluate
  expect(ret).toEqual({
    service: { conf: {} },
    unsubscribers: {},
    me: {},
    accounts: [],
    users: [],
    profiles: [],
    groups: [],
    groupChats: {},
    hotlines: {},
    categories: [],
    invitations: {},
    route: {},
    secrets: {},
    waitProc: null
  })
})

test('initServiceData()' +
  ' should set initial data and realtime updating to state.service.', async () => {
  // prepare
  const state = {}
  await db.collection('service').doc('conf').set({
    test01: 'test01'
  })
  await db.collection('service').doc('defaults').set({
    test11: 'test11'
  })

  // run #0
  const unsub = await initServiceData({ db, state })

  // evaluate #0
  expect(state).toMatchObject({
    service: {
      conf: {
        test01: 'test01'
      },
      defaults: {
        test11: 'test11'
      }
    }
  })

  // run #1
  await db.collection('service').doc('conf').update({
    test01: 'test01a'
  })
  await waitRealtimeUpdate()

  // evaluate #1
  expect(state).toMatchObject({
    service: {
      conf: {
        test01: 'test01a'
      },
      defaults: {
        test11: 'test11'
      }
    }
  })

  // clean
  unsub()
})

test('updateMe()' +
  ' should set the given doc data and auth providers data to state.me.', async () => {
  // prepare #0
  const state = {}
  const auth = {}
  const doc = { id: 'id01', valid: true }

  // run #0
  updateMe({ state, auth }, doc)

  // evaluate #0
  expect(state.me).toMatchObject({
    id: 'id01',
    valid: true,
    google_com: false,
    apple_com: false,
    facebook_com: false,
    github_com: false,
    microsoft_com: false,
    twitter_com: false,
    line_me: false,
    yahoo_co_jp: false,
    mixi_jp: false
  })

  // prepare #1
  auth.currentUser = {
    providerData: [
      { providerId: 'apple.com' },
      { providerId: 'github.com' }
    ]
  }
  doc.id = 'id02'
  doc.line_me = true

  // run #1
  updateMe({ state, auth }, doc)

  // evaluate #1
  expect(state.me).toMatchObject({
    id: 'id02',
    valid: true,
    google_com: false,
    apple_com: true,
    facebook_com: false,
    github_com: true,
    microsoft_com: false,
    twitter_com: false,
    line_me: true,
    yahoo_co_jp: false,
    mixi_jp: false
  })
})

test('updateMe()' +
  ' should update state.me with auth providers data.', async () => {
  // prepare
  const state = {
    me: {
      id: 'id01',
      valid: true,
      google_com: false,
      apple_com: false,
      facebook_com: false,
      github_com: false,
      microsoft_com: false,
      twitter_com: false,
      line_me: false,
      yahoo_co_jp: false,
      mixi_jp: false
    }
  }
  const auth = {
    currentUser: {
      providerData: [
        { test: 'test' },
        { providerId: 'apple.com' },
        { providerId: 'github.com' }
      ]
    }
  }

  // run
  updateMe({ state, auth })

  // evaluate
  expect(state.me).toMatchObject({
    id: 'id01',
    valid: true,
    google_com: false,
    apple_com: true,
    facebook_com: false,
    github_com: true,
    microsoft_com: false,
    twitter_com: false,
    line_me: false,
    yahoo_co_jp: false,
    mixi_jp: false
  })
})

test('initMe()' +
  ' should update state.me with firestore data.', async () => {
  // prepare
  const id = 'id01'
  await db.collection('accounts').doc(id).set({
    valid: true
  })
  const state = {}
  const auth = {}

  // run
  await initMe({ db, state, auth }, 'id01')

  // evaluate
  expect(state.me).toMatchObject({
    id: 'id01',
    valid: true,
    google_com: false,
    apple_com: false,
    facebook_com: false,
    github_com: false,
    microsoft_com: false,
    twitter_com: false,
    line_me: false,
    yahoo_co_jp: false,
    mixi_jp: false
  })
})

test('initUserData()' +
  ' should get all data if me is manager,' +
  ' and reset state.loading.', async () => {
  // prepare
  await testData()
  await db.collection('accounts').doc('user1').set({ valid: true })
  await db.collection('users').doc('user1').set({ name: 'User 1' })
  await db.collection('profiles').doc('user1').set({ test: 'test' })
  await db.collection('groups').doc('all').update({ members: ['primary', 'user1'] })
  await db.collection('groups').doc('managers').update({ members: ['primary', 'user1'] })
  const state = clearUserData({ service: {} })
  await initMe({ db, auth, state }, 'user1')

  // run
  await initUserData({ db, auth, state })

  // evaluate
  expect(state.groups).toHaveLength(4)
  expect(state.accounts).toHaveLength(2)
  expect(state.users).toHaveLength(2)
  expect(state.profiles).toHaveLength(2)
  expect(state.loading).toBeFalsy()

  // clear
  unsubscribeAll(state)
})

test('initUserData()' +
  ' should get all data except profiles if me is admin.,' +
  ' and reset state.loading.', async () => {
  // prepare
  await testData()
  await db.collection('accounts').doc('user1').set({ valid: true })
  await db.collection('users').doc('user1').set({ name: 'User 1' })
  await db.collection('profiles').doc('user1').set({ test: 'test' })
  await db.collection('groups').doc('all').update({ members: ['primary', 'user1'] })
  await db.collection('groups').doc('admins').update({ members: ['primary', 'user1'] })
  const state = clearUserData({ service: {} })
  await initMe({ db, auth, state }, 'user1')

  // run
  await initUserData({ db, auth, state })

  // evaluate
  expect(state.groups).toHaveLength(4)
  expect(state.accounts).toHaveLength(2)
  expect(state.users).toHaveLength(2)
  expect(state.profiles).toHaveLength(1)
  expect(state.profiles[0].id).toEqual('user1')
  expect(state.loading).toBeFalsy()

  // clear
  unsubscribeAll(state)
})

test('initUserData()' +
  ' should get all data except profiles and accounts if me is user.,' +
  ' and reset state.loading.', async () => {
  // prepare
  await testData()
  await db.collection('accounts').doc('user1').set({ valid: true })
  await db.collection('users').doc('user1').set({ name: 'User 1' })
  await db.collection('profiles').doc('user1').set({ test: 'test' })
  await db.collection('groups').doc('all').update({ members: ['primary', 'user1'] })
  const state = clearUserData({ service: {} })
  await initMe({ db, auth, state }, 'user1')

  // run
  await initUserData({ db, auth, state })
  await db.collection('accounts').doc('primary').update({ valid: false })
  await waitRealtimeUpdate()

  // evaluate
  expect(state.groups).toHaveLength(4)
  expect(state.accounts).toHaveLength(1)
  expect(state.accounts[0].id).toEqual('user1')
  expect(state.users).toHaveLength(2)
  expect(state.profiles).toHaveLength(1)
  expect(state.profiles[0].id).toEqual('user1')
  expect(state.loading).toBeFalsy()

  // clear
  unsubscribeAll(state)
})

test('getInitialAndRealtimeData()' +
  ' should set initial data and realtime updating to the list of given id.', async () => {
  // prepare
  const queryRef = db.collection('groups')
  const counter = {
    onChange: 0
  }
  const onChange = () => { counter.onChange++ }
  await db.collection('groups').doc('group1').set({ name: 'Group 1' })
  const state = {
    groups: [],
    unsubscribers: {}
  }

  // run #1
  await getInitialAndRealtimeData(state, 'groups', queryRef, onChange)
  await waitRealtimeUpdate()

  // evaluate #1
  expect(state.groups).toHaveLength(1)
  expect(state.groups[0]).toMatchObject({
    id: 'group1',
    name: 'Group 1'
  })
  expect(state.unsubscribers.groups).toBeDefined()

  // run #2
  await db.collection('groups').doc('group1').update({ name: 'modified name' })
  await waitRealtimeUpdate()

  // evaluate #2
  expect(state.groups).toHaveLength(1)
  expect(state.groups[0]).toMatchObject({
    id: 'group1',
    name: 'modified name'
  })

  // clear
  unsubscribeAll(state)
})

test('findItem()' +
  ' should return the item has the given id from given list.', async () => {
  // prepare
  const list1 = [{ id: 'id01' }, { id: 'id02' }]

  // run
  const ret0 = findItem(undefined, 'id01')
  const ret1 = findItem(null, 'id01')
  const ret2 = findItem([], 'id01')
  const ret3 = findItem(list1)
  const ret4 = findItem(list1, null)
  const ret5 = findItem(list1, 'id00')
  const ret6 = findItem(list1, 'id01')
  const ret7 = findItem(list1, 'id02')

  // evaluate
  expect(ret0).toEqual({})
  expect(ret1).toEqual({})
  expect(ret2).toEqual({})
  expect(ret3).toEqual({})
  expect(ret4).toEqual({})
  expect(ret5).toEqual({})
  expect(ret6).toEqual({ id: 'id01' })
  expect(ret7).toEqual({ id: 'id02' })
})
