const {
  db,
  messaging,
  clearDb,
  deleteApp,
  testData
} = require('./utils')
const {
  notifyMessage
} = require('../../notification')

beforeEach(async () => {
  messaging.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('notifyMessage()' +
  ' send notification to gtoup members except sender.', async () => {

  // prepare #1
  const messageId = '20201030010203000004'
  const account01Id = 'account01'
  const account02Id = 'account02'
  const account01Ref = db.collection('accounts').doc(account01Id)
  await account01Ref.set({
    valid: true,
    messagingTokens: []
  })
  const account02Ref = db.collection('accounts').doc(account02Id)
  await account02Ref.set({
    valid: true,
    messagingTokens: []
  })
  await db.collection('groups').doc('all').update({
    members: ['admin01', account01Id, account02Id]
  })
  await db.collection('groups').doc('admins').update({
    members: ['admin01', account01Id]
  })
  const messageRef = db.collection('groups').doc('admins')
    .collection('messages').doc(messageId)
  await messageRef.set({
    sender: account01Id
  })
  const message01 = await messageRef.get()

  // run #1
  await notifyMessage(message01, { db, messaging })

  // evaluate #1
  expect(messaging.data.message).toBeUndefined()

  // prepare #2
  messaging.clear()
  const token01 = 'token01'
  await account01Ref.update({
    messagingTokens: [
      { token: token01, ts: new Date() }
    ]
  })

  // run #2
  await notifyMessage(message01, { db, messaging })

  // evaluate #2
  expect(messaging.data.message).toBeUndefined()

  // prepare #3
  messaging.clear()
  await messageRef.set({
    sender: 'admin01'
  })
  const message02 = await messageRef.get()

  // run #3
  await notifyMessage(message02, { db, messaging })

  // evaluate #3
  expect(messaging.data.message.tokens.length).toEqual(1)
  expect(messaging.data.message.tokens).toContain(token01)

  // prepare #4
  messaging.clear()
  await account01Ref.update({
    notifiedAt: {
      admins: null,
      managers: new Date()
    }
  })

  // run #4
  await notifyMessage(message02, { db, messaging })

  // evaluate #4
  expect(messaging.data.message.tokens.length).toEqual(1)
  expect(messaging.data.message.tokens).toContain(token01)

  // prepare #5
  messaging.clear()
  await account01Ref.update({
    notifiedAt: {
      admins: new Date(),
      managers: null
    }
  })

  // run #5
  await notifyMessage(message02, { db, messaging })

  // evaluate #5
  expect(messaging.data.message).toBeUndefined()

  // prepare #6
  messaging.clear()
  await account01Ref.update({
    notifiedAt: {
      admins: null,
      managers: new Date()
    }
  })
  const token02 = 'token02'
  const token03 = 'token03'
  await db.collection('accounts').doc('admin01').update({
    messagingTokens: [
      { token: token02, ts: new Date() },
      { token: token03, ts: new Date() }
    ]
  })
  await db.collection('groups').doc('admins').update({
    members: ['admin01', account01Id, 'dummy']
  })
  await messageRef.set({
    sender: account02Id
  })
  const message03 = await messageRef.get()

  // run #6
  await notifyMessage(message03, { db, messaging })

  // evaluate #4
  expect(messaging.data.message.tokens.length).toEqual(3)
  expect(messaging.data.message.tokens).toContain(token01)
  expect(messaging.data.message.tokens).toContain(token02)
  expect(messaging.data.message.tokens).toContain(token03)
})
