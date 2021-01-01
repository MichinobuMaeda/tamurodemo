import {
  admin,
  clearDb,
  deleteApp,
  // testData,
  setFakeWindow,
  store
} from '../utils'
import {
  authProviders
} from '../../../src/auth/providers'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
  // await clearDb()
  // await testData()
  setFakeWindow()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('authProviders()' +
  ' should return providers list.', async () => {
  // prepare

  // run
  const providers = authProviders(store)

  // evaluate
  expect(providers.length).toEqual(9)
  expect(providers.find(item => item.id === 'google.com').type).toEqual('oauth')
  expect(providers.find(item => item.id === 'apple.com').type).toEqual('oauth')
  expect(providers.find(item => item.id === 'facebook.com').type).toEqual('oauth')
  expect(providers.find(item => item.id === 'github.com').type).toEqual('oauth')
  expect(providers.find(item => item.id === 'microsoft.com').type).toEqual('oauth')
  expect(providers.find(item => item.id === 'twitter.com').type).toEqual('oauth')
  expect(providers.find(item => item.id === 'line.me').type).toEqual('custom')
  expect(providers.find(item => item.id === 'yahoo.co.jp').type).toEqual('custom')
  expect(providers.find(item => item.id === 'mixi.jp').type).toEqual('custom')
})

test('toggleOAuthProvider()' +
  ' should call unlink() and update account in db' +
  ' if the provider is linked and type of it is "oauth".', async () => {
  // prepare
  store.auth.currentUser.uid = 'account01'
  store.state.me = {
    id: 'account01',
    google_com: true
  }
  const accountRef = admin.firestore()
    .collection('accounts')
    .doc(store.auth.currentUser.uid)
  await accountRef.set({
    google_com: true
  })
  const providers = authProviders(store)
  const google = providers.find(item => item.id === 'google.com')

  // run
  await google.update()

  // evaluate
  expect(store.auth.currentUser.data.unlink.id).toEqual('google.com')
  const account01 = await accountRef.get()
  expect(account01.data().google_com).toBeNull()
})

test('toggleOAuthProvider()' +
  ' should update account in db' +
  ' if the provider is linked and type of it is "custom".', async () => {
  // prepare
  store.auth.currentUser.uid = 'account01'
  store.state.me = {
    id: 'account01',
    line_me: true
  }
  const accountRef = admin.firestore()
    .collection('accounts')
    .doc(store.auth.currentUser.uid)
  await accountRef.set({
    line_me: true
  })
  const providers = authProviders(store)
  const line = providers.find(item => item.id === 'line.me')

  // run
  await line.update()

  // evaluate
  expect(store.auth.currentUser.data.unlink).not.toBeDefined()
  const account01 = await accountRef.get()
  expect(account01.data().line_me).toBeNull()
})

test('toggleOAuthProvider()' +
  ' should call linkWithRedirect() and update account in db' +
  ' if the provider is not linked and type of it is "oauth".', async () => {
  // prepare
  store.auth.currentUser.uid = 'account01'
  store.state.me = {
    id: 'account01',
    google_com: null
  }
  const accountRef = admin.firestore()
    .collection('accounts')
    .doc(store.auth.currentUser.uid)
  await accountRef.set({
    google_com: null
  })
  const providers = authProviders(store)
  const google = providers.find(item => item.id === 'google.com')

  // run
  await google.update()

  // evaluate
  expect(store.auth.currentUser.data.linkWithRedirect.provider).toBeDefined()
  const account01 = await accountRef.get()
  expect(account01.data().google_com).toBeTruthy()
})

test('signInWithFirebaseAuthProvider()' +
  ' should call signInWithRedirect().', async () => {
  // prepare
  const providers = authProviders(store)
  const google = providers.find(item => item.id === 'google.com')

  // run
  await google.signIn()

  // evaluate
  expect(store.auth.data.signInWithRedirect.provider).toBeDefined()
})

test('signInWithCustomProvider()' +
  ' should ... TODO ...', async () => {
  // prepare
  const providers = authProviders(store)
  const line = providers.find(item => item.id === 'line.me')

  // run
  await line.signIn()

  // evaluate
  // TODO
})

test('linkWithCustomProvider()' +
  ' should ... TODO ...', async () => {
  // prepare
  const providers = authProviders(store)
  const line = providers.find(item => item.id === 'line.me')
  store.state.me = {
    id: 'account01',
    line_me: false
  }

  // run
  await line.update()

  // evaluate
  // TODO
})
