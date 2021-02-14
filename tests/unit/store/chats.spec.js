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
  unsubscribeAll
} from '../../../src/store/state'
import {
  subscribeGroupChats,
  subscribeHotlines,
  postGroupChat,
  postHotline
} from '../../../src/store/chats'

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

test('subscribeGroupChats()' +
  ' should update group chat subscribes.', async () => {
  // prepare #1
  const id = 'id01'
  await db.collection('groups').doc('all').set({ members: [id] })
  await db.collection('groups').doc('group0').set({ members: [] })
  await db.collection('groups').doc('group1').set({ members: [id] })
  await db.collection('groups').doc('group2').set({ members: [id] })
  const counter = {
    all: 0,
    unsub0: 0,
    unsub1: 0,
    unsub2: 0
  }
  const state = {
    me: {
      id,
      valid: true
    },
    categories: [],
    groups: [
      { id: 'all', members: [id] },
      { id: 'group0', members: [] },
      { id: 'group1', members: [id] },
      { id: 'group2', members: [id] }
    ],
    groupChats: {},
    unsubscribers: {
      chat_all: () => { counter.all++ },
      chat_group0: () => { counter.unsub0++ },
      chat_group1: () => { counter.unsub1++ }
    }
  }

  // run #1
  subscribeGroupChats({ db, state })

  // evaluate #1
  expect(counter).toEqual({
    all: 0,
    unsub0: 1,
    unsub1: 0,
    unsub2: 0
  })
  expect(Object.keys(state.unsubscribers)).toHaveLength(3)
  expect(state.unsubscribers.chat_all).toBeDefined()
  expect(state.unsubscribers.chat_group0).not.toBeDefined()
  expect(state.unsubscribers.chat_group1).toBeDefined()
  expect(state.unsubscribers.chat_group2).toBeDefined()

  // prepare #2

  // run #2
  await db.collection('groups').doc('group1').collection('chat').doc('202012312459').set({
    sender: 'id01',
    message: 'chat message',
    createdAt: new Date()
  })
  await waitRealtimeUpdate()

  // evaluate #2
  expect(state.groupChats.group1[0]).toMatchObject({
    id: '202012312459',
    sender: 'id01'
  })

  // prepare #3
  counter.all = 0
  counter.unsub0 = 0
  counter.unsub1 = 0
  counter.unsub2 = 0

  // evaluate #1
  expect(counter).toEqual({
    all: 0,
    unsub0: 0,
    unsub1: 0,
    unsub2: 0
  })
  expect(Object.keys(state.unsubscribers)).toHaveLength(3)
  expect(state.unsubscribers.chat_all).toBeDefined()
  expect(state.unsubscribers.chat_group0).not.toBeDefined()
  expect(state.unsubscribers.chat_group1).toBeDefined()
  expect(state.unsubscribers.chat_group2).toBeDefined()

  // run #3
  subscribeGroupChats({ db, state })

  // clear
  unsubscribeAll(state)
})

test('subscribeHotlines()' +
  ' should update hotline subscribes.', async () => {
  // prepare #1
  const id = 'account0'
  await db.collection('accounts').doc('account0').set({ valid: true })
  await db.collection('accounts').doc('account1').set({ valid: true })
  await db.collection('accounts').doc('account2').set({ valid: false })
  await db.collection('accounts').doc('account3').set({ valid: true })
  const counter = {
    unsub0: 0,
    unsub1: 0,
    unsub2: 0,
    unsub3: 0
  }
  const state = {
    me: {
      id,
      valid: true
    },
    categories: [],
    accounts: [
      { id: 'account0', valid: true },
      { id: 'account2', valid: false },
      { id: 'account3', valid: true }
    ],
    hotlines: {
      account0: [],
      account1: [],
      account2: []
    },
    unsubscribers: {
      hotline_account0: () => { counter.unsub0++ },
      hotline_account1: () => { counter.unsub1++ },
      hotline_account2: () => { counter.unsub2++ }
    }
  }

  // run #1
  subscribeHotlines({ db, state })

  // evaluate #1
  expect(counter).toEqual({
    unsub0: 0,
    unsub1: 1,
    unsub2: 0,
    unsub3: 0
  })
  expect(Object.keys(state.unsubscribers)).toHaveLength(3)
  expect(state.unsubscribers.hotline_account0).toBeDefined()
  expect(state.unsubscribers.hotline_account1).not.toBeDefined()
  expect(state.unsubscribers.hotline_account2).toBeDefined()
  expect(state.unsubscribers.hotline_account3).toBeDefined()

  // prepare #2

  // run #2
  await db.collection('accounts').doc('account3').collection('hotline').doc('202012312459').set({
    sender: 'account0',
    message: 'hotline message',
    createdAt: new Date()
  })
  await waitRealtimeUpdate()

  // evaluate #2
  expect(state.hotlines.account3[0]).toMatchObject({
    id: '202012312459',
    sender: 'account0'
  })

  // prepare #3
  counter.unsub0 = 0
  counter.unsub1 = 0
  counter.unsub2 = 0
  counter.unsub3 = 0

  // run #3
  subscribeHotlines({ db, state })

  // evaluate #3
  expect(counter).toEqual({
    unsub0: 0,
    unsub1: 0,
    unsub2: 0,
    unsub3: 0
  })
  expect(Object.keys(state.unsubscribers)).toHaveLength(3)
  expect(state.unsubscribers.hotline_account0).toBeDefined()
  expect(state.unsubscribers.hotline_account1).not.toBeDefined()
  expect(state.unsubscribers.hotline_account2).toBeDefined()
  expect(state.unsubscribers.hotline_account3).toBeDefined()

  // clear
  unsubscribeAll(state)
})

test('postGroupChat()' +
  ' should add a chat message of the group.', async () => {
  // prepare
  const state = {
    me: {
      id: 'account01',
      valid: true
    }
  }
  const groupRef = db.collection('groups').doc('group1')
  await groupRef.set({ name: 'Group 1', members: [state.me.id] })

  // run #1
  await postGroupChat({ db, state }, groupRef.id, 'Message 1')

  // evaluate #2
  const messages1 = (await groupRef.collection('chat').orderBy('createdAt', 'asc').get()).docs
  expect(messages1).toHaveLength(1)
  expect(messages1[0].data()).toMatchObject({
    sender: state.me.id,
    message: 'Message 1'
  })

  // run #1
  await postGroupChat({ db, state }, groupRef.id, 'Message 2')

  // evaluate #2
  const messages2 = (await groupRef.collection('chat').orderBy('createdAt', 'asc').get()).docs
  expect(messages2).toHaveLength(2)
  expect(messages2[0].data()).toMatchObject({
    sender: state.me.id,
    message: 'Message 1'
  })
  expect(messages2[1].data()).toMatchObject({
    sender: state.me.id,
    message: 'Message 2'
  })
})

test('postHotline()' +
  ' should add an hotline message of the account.', async () => {
  // prepare
  const state = {
    me: {
      id: 'account01',
      valid: true
    }
  }
  const accountRef = db.collection('accounts').doc('account2')
  await accountRef.set({ name: 'Account 1' })

  // run #1
  await postHotline({ db, state }, accountRef.id, 'Message 1')

  // evaluate #2
  const messages1 = (await accountRef.collection('hotline').orderBy('createdAt', 'asc').get()).docs
  expect(messages1).toHaveLength(1)
  expect(messages1[0].data()).toMatchObject({
    sender: state.me.id,
    message: 'Message 1'
  })

  // run #1
  await postHotline({ db, state }, accountRef.id, 'Message 2')

  // evaluate #2
  const messages2 = (await accountRef.collection('hotline').orderBy('createdAt', 'asc').get()).docs
  expect(messages2).toHaveLength(2)
  expect(messages2[0].data()).toMatchObject({
    sender: state.me.id,
    message: 'Message 1'
  })
  expect(messages2[1].data()).toMatchObject({
    sender: state.me.id,
    message: 'Message 2'
  })
})
