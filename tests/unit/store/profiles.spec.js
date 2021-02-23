import {
  admin,
  deleteApp,
  store,
  clearDb
} from '../_testUtils'
import {
  profileUtils,
  init
} from '../../../src/store/profiles'
import {
  castDoc
} from '../../../src/store/firestore'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

const db = admin.firestore()

test('addressIndexes' +
  ' should be initialized with state.service.conf.profileAddressCount.', async () => {
  // #1 prepare
  const { state } = store
  const { addressIndexes } = profileUtils(store, {})
  state.service = {
    conf: {
      profileAddressCount: undefined
    }
  }

  // #1 run

  // #1 evaluate
  expect(addressIndexes.value).toEqual([
    'add1'
  ])

  // #2 prepare
  state.service.conf.profileAddressCount = 3

  // #2 run

  // #12evaluate
  expect(addressIndexes.value).toEqual([
    'add1', 'add2', 'add3'
  ])
})

test('itemPermittsion' +
  ' should return whether the logged in user is authorized to read the item of the profile.', async () => {
  // #1 prepare
  const { state } = store
  const id = 'account01'
  state.profiles = [
    {
      id,
      item1_p: 'a',
      item2_p: 'c',
      item3_p: 'm'
    }
  ]
  const props = {
    id,
    preview: 'm'
  }
  const { itemPermittsion } = profileUtils(store, props)

  // #1 run
  const ret11 = itemPermittsion('item1')
  const ret12 = itemPermittsion('item2')
  const ret13 = itemPermittsion('item3')

  // #1 evaluate
  expect(ret11).toBeTruthy()
  expect(ret12).toBeTruthy()
  expect(ret13).toBeTruthy()

  // #2 prepare
  props.preview = 'c'

  // #2 run
  const ret21 = itemPermittsion('item1')
  const ret22 = itemPermittsion('item2')
  const ret23 = itemPermittsion('item3')

  // #2 evaluate
  expect(ret21).toBeTruthy()
  expect(ret22).toBeTruthy()
  expect(ret23).toBeFalsy()

  // #3 prepare
  props.preview = 'a'

  // #3 run
  const ret31 = itemPermittsion('item1')
  const ret32 = itemPermittsion('item2')
  const ret33 = itemPermittsion('item3')

  // #3 evaluate
  expect(ret31).toBeTruthy()
  expect(ret32).toBeFalsy()
  expect(ret33).toBeFalsy()

  // #4 prepare
  props.preview = 'm'
  props.edit = true

  // #4 run
  const ret41 = itemPermittsion('item1')
  const ret42 = itemPermittsion('item2')
  const ret43 = itemPermittsion('item3')

  // #4 evaluate
  expect(ret41).toBeTruthy()
  expect(ret42).toBeTruthy()
  expect(ret43).toBeTruthy()

  // #5 prepare
  props.preview = 'c'
  props.edit = true

  // #5 run
  const ret51 = itemPermittsion('item1')
  const ret52 = itemPermittsion('item2')
  const ret53 = itemPermittsion('item3')

  // #5 evaluate
  expect(ret51).toBeTruthy()
  expect(ret52).toBeTruthy()
  expect(ret53).toBeTruthy()

  // #6 prepare
  props.preview = 'a'
  props.edit = true

  // #6 run
  const ret61 = itemPermittsion('item1')
  const ret62 = itemPermittsion('item2')
  const ret63 = itemPermittsion('item3')

  // #6 evaluate
  expect(ret61).toBeTruthy()
  expect(ret62).toBeTruthy()
  expect(ret63).toBeTruthy()
})

test('socialItems' +
  ' should be keys of social media items filterd by permissions.', async () => {
  // prepare
  const { state, conf } = store
  const id = 'account01'
  state.me = {
    id: 'myid',
    valid: true,
    locale: 'ja_JP'
  }
  state.profiles = [
    {
      id,
      item1_p: 'a',
      item2_p: 'c',
      item3_p: 'm'
    }
  ]
  conf.locales = [
    {
      value: 'ja_JP',
      socialItems: [
        { key: 'item1' },
        { key: 'item2' },
        { key: 'item3' },
        { key: 'item4' }
      ]
    }
  ]
  const props = {
    id,
    preview: 'c'
  }
  const { socialItems } = profileUtils(store, props)

  // run

  // evaluate
  expect(socialItems.value).toEqual([
    { key: 'item1' },
    { key: 'item2' }
  ])
})

test('contactItems' +
  ' should return keys of address items with prefix filterd by permissions.', async () => {
  // prepare
  const { state, conf } = store
  const id = 'account01'
  state.me = {
    id: 'myid',
    valid: true,
    locale: 'ja_JP'
  }
  state.profiles = [
    {
      id,
      add1_item1_p: 'a',
      add2_item2_p: 'c',
      add1_item3_p: 'm'
    }
  ]
  conf.locales = [
    {
      value: 'ja_JP',
      addressItems: [
        { key: 'item1' },
        { key: 'item2' },
        { key: 'item3' },
        { key: 'item4' }
      ]
    }
  ]
  const props = {
    id,
    preview: 'c'
  }
  const { contactItems } = profileUtils(store, props)

  // run

  // evaluate
  expect(contactItems.value('add1')).toEqual([
    { key: 'add1_item1' }
  ])
})

test('permittedGroups' +
  ' should be the lisi of groups with permissions for the "c" items.', async () => {
  // #1 prepare
  const { state } = store
  const id = 'account01'
  state.profiles = [{ id }]
  state.groups = [
    { id: 'group1' },
    { id: 'group2', deletedAt: null },
    { id: 'group3', deletedAt: new Date() },
    { id: 'group4' }
  ]
  const props = {
    id
  }
  const test1 = profileUtils(store, props)

  // #1 run

  // #1 evaluate
  expect(test1.permittedGroups.value).toEqual([])

  // #2 prepare
  state.profiles[0].permittedGroups = ['group1', 'group2', 'group3']
  const test2 = profileUtils(store, props)

  // #2 run

  // #2 evaluate
  expect(test2.permittedGroups.value).toEqual([
    { id: 'group1' },
    { id: 'group2', deletedAt: null }
  ])
})

test('permittedUsers' +
  ' should be the lisi of users with permissions for the "c" items.', async () => {
  // #1 prepare
  const { state } = store
  const id = 'account01'
  state.profiles = [{ id }]
  state.users = [
    { id: 'user1' },
    { id: 'user2', deletedAt: null },
    { id: 'user3', deletedAt: new Date() },
    { id: 'user4' }
  ]
  const props = {
    id
  }
  const test1 = profileUtils(store, props)

  // #1 run

  // #1 evaluate
  expect(test1.permittedUsers.value).toEqual([])

  // #2 prepare
  state.profiles[0].permittedUsers = ['user1', 'user2', 'user3']
  const test2 = profileUtils(store, props)

  // #2 run

  // #2 evaluate
  expect(test2.permittedUsers.value).toEqual([
    { id: 'user1' },
    { id: 'user2', deletedAt: null }
  ])
})

test('setProfile' +
  ' should update the item value of given key of the profile, ' +
  ' and update the permission of the item of given key.' +
  ' and update user.updatedAt with same value of profile.updatedAt.', async () => {
  // #1 prepare
  const { state } = store
  const id = 'account01'
  const key = 'item1'
  const props = { id }
  state.users = []
  const userRef = db.collection('users').doc(id)
  await userRef.set({ name: 'User 1' })
  state.profiles = []
  const profileRef = db.collection('profiles').doc(id)
  await profileRef.set({ createdAt: new Date() })
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())
  console.log(store.profile(id))
  const { setProfile } = profileUtils(store, props)

  // #1 run
  await setProfile(key, 'new text')
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #1 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'm',
    [key]: 'new text',
    updatedAt: state.users[0].updatedAt
  })

  // #2 run
  await setProfile(key, 'text', 'c')
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #2 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'c',
    [key]: 'text',
    updatedAt: state.users[0].updatedAt
  })

  // #3 run
  await setProfile(key, 'new text', 'c')
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #3 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'c',
    [key]: 'new text',
    updatedAt: state.users[0].updatedAt
  })

  // cleanup
  await clearDb()
})

test('switchPermission' +
  ' should update the permission of given key "m" --> "c" --> "a" --> "m", ' +
  ' and update user.updatedAt with same value of profile.updatedAt.', async () => {
  // #1 prepare
  const { state } = store
  const id = 'account01'
  const key = 'item1'
  const props = { id }
  state.users = []
  const userRef = db.collection('users').doc(id)
  await userRef.set({ name: 'User 1' })
  state.profiles = []
  const profileRef = db.collection('profiles').doc(id)
  await profileRef.set({ [key]: 'text' })
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())
  console.log(store.profile(id))
  const { switchPermission } = profileUtils(store, props)

  // #1 run
  await switchPermission(key)
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #1 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'c',
    updatedAt: state.users[0].updatedAt
  })

  // #2 run
  await switchPermission(key)
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #2 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'a',
    updatedAt: state.users[0].updatedAt
  })

  // #3 run
  await switchPermission(key)
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #3 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'm',
    updatedAt: state.users[0].updatedAt
  })

  // #4 run
  await switchPermission(key)
  state.users[0] = castDoc(await userRef.get())
  state.profiles[0] = castDoc(await profileRef.get())

  // #4 evaluate
  expect(state.profiles[0]).toMatchObject({
    [`${key}_p`]: 'c',
    updatedAt: state.users[0].updatedAt
  })

  // cleanup
  await clearDb()
})

test('previewProfile' +
  ' should be initialized with the value 2.', async () => {
  // prepare
  init(store)

  // run

  // evaluate
  expect(store.previewProfile.value).toEqual(2)
})

test('picon' +
  ' should be initialized with the conf.permissions.', async () => {
  // prepare
  init(store)

  // run

  // evaluate
  expect(store.picon.value).toEqual({
    a: store.conf.permissions.find(item => item.value === 'a').icon,
    c: store.conf.permissions.find(item => item.value === 'c').icon,
    m: store.conf.permissions.find(item => item.value === 'm').icon
  })
})

test('getProfile()' +
  ' should call functions: "getProfile" ' +
  'and set the result.data to state.profiles.', async () => {
  // #1 prepare
  const { functions, state } = store
  const id = 'account02'
  const ts = new Date('2020-01-01T00:00:00.000Z')
  state.profiles = [
    {
      id: 'account01',
      lastName: 'User 1',
      createdAt: ts,
      updatedAt: ts
    }
  ]
  init(store)
  functions.results.getProfile = {
    data: {
      id,
      lastName: 'User 2',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z'
    }
  }

  // #1 run
  await store.getProfile(id)

  // #1 evaluate
  expect(state.profiles).toHaveLength(2)
  expect(state.profiles.find(item => item.id === id)).toEqual({
    id,
    lastName: 'User 2',
    createdAt: ts,
    updatedAt: ts
  })

  // #2 prepare
  functions.results.getProfile = {
    data: {
      id,
      lastName: 'User 2',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
      deletedAt: '2020-01-01T00:00:00.000Z'
    }
  }

  // #12run
  await store.getProfile(id)

  // #2 evaluate
  expect(state.profiles).toHaveLength(2)
  expect(state.profiles.find(item => item.id === id)).toEqual({
    id,
    lastName: 'User 2',
    createdAt: ts,
    updatedAt: ts,
    deletedAt: ts
  })
})
