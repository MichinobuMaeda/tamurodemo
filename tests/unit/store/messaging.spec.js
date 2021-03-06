import {
  admin,
  auth,
  clearDb,
  deleteApp,
  // testData,
  store
} from '../_testUtils'
import {
  initializeMessaging
} from '../../../src/store/messaging'

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
