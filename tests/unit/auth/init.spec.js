import {
  admin,
  auth,
  router,
  setFakeWindow,
  clearDb,
  deleteApp,
  store
} from '../_testUtils'
import {
  getAuthState,
  returnLastRoute,
  signOut
} from '../../../src/auth/init'
import {
  storeRequestedRoute
} from '../../../src/auth/localStrage'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

const db = admin.firestore()

test('getAuthState()' +
  ' should call auth.signInWithEmailLink() if URL is sign-in-with-email-link.', async () => {
  // prepare
  setFakeWindow()
  const email = 'abc@exampe.com'
  auth.data.isSignInWithEmailLink = true
  window.localStorage.data.tamuroEmailLinkRequest = email
  const state = {}

  // run
  await getAuthState({ db, auth, state })

  // evaluate
  expect(store.auth.data.signInWithEmailLink.email).toEqual(email)
})

test('getAuthState()' +
  ' should set callback to auth.onAuthStateChanged() if URL is not sign-in-with-email-link.', async () => {
  // prepare #0
  auth.data.isSignInWithEmailLink = false
  const state = {}
  const user = {
    uid: 'id01'
  }

  // run #0
  await getAuthState({ db, auth, state })

  // evaluate #0
  const cb = auth.data.onAuthStateChanged
  expect(cb).toBeInstanceOf(Function)

  // prepare #1
  state.me = { id: user.uid, valid: true }
  state.loading = true

  // run #1
  await cb(user)

  // evaluate #1
  expect(state.me).toEqual({})
  expect(state.loading).toBeFalsy()

  // prepare #2
  await db.collection('accounts').doc(user.uid).set({ valid: true })
  state.me = { id: user.uid, valid: true }
  state.loading = true

  // run #2
  await cb(null)

  // evaluate #2
  expect(state.me).toEqual({})
  expect(state.loading).toBeFalsy()

  // prepare #3
  state.loading = true

  // run #2
  await cb(user)

  // evaluate #2
  expect(state.me.id).toEqual(user.uid)
  expect(state.loading).toBeTruthy()
})

test('returnLastRoute()' +
  ' should push the saved route to router if the route has been saved.', async () => {
  // prepare #1
  setFakeWindow()
  router.clear()

  // run #1
  returnLastRoute(router)

  // evaluate #1
  expect(router.data.push).not.toBeDefined()

  // prepare #2
  router.clear()
  storeRequestedRoute({})

  // run #2
  returnLastRoute(router)

  // evaluate #2
  expect(router.data.push).not.toBeDefined()

  // prepare #3
  router.clear()
  storeRequestedRoute({ name: 'name1' })

  // run #3
  returnLastRoute(router)
  router.onRejected()

  // evaluate #3
  expect(router.data.push).toEqual({ name: 'name1' })
  expect(router.data.pushCatched).toBeTruthy()
})

test('signOut()' +
  ' should call auth.signOut().', async () => {
  // prepare

  // run
  await signOut({ auth })

  // evaluate
  expect(auth.data.signOut.called).toBeTruthy()
})
