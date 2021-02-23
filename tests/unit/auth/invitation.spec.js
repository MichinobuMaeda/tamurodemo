import {
  admin,
  clearDb,
  deleteApp,
  testData,
  setFakeWindow,
  store
} from '../_testUtils'
import {
  invite,
  invitationUrl,
  validateInvitation,
  updateInvitationStatus
} from '../../../src/auth/invitation'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
  await clearDb()
  await testData()
  setFakeWindow()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('invite()' +
  ' should call function: invite with given id.', async () => {
  // prepare
  const id = 'account01'

  // run
  await invite(store, id)

  // evaluate
  expect(store.functions.inputs.invite.id).toEqual(id)
})

test('invitationUrl()' +
  ' should return the URL for given invitation for given id.', async () => {
  // #1 prepare
  const id = 'account01'
  const invitation = 'invitation01'
  const router = {
    resolve: route => ({
      resolved: {
        path: `/${route.name}s/${route.params.invitation}`
      }
    })
  }
  store.state.accounts = [
    {
      id,
      invitation,
      valid: true
    }
  ]

  // #1 run
  const result1 = invitationUrl(store.state, router, id)

  // #1 evaluate
  expect(result1).toEqual(`http://localhost:5000/#/invitations/${invitation}`)

  // #2 run
  const result2 = invitationUrl(store.state, router, '')

  // #2 evaluate
  expect(result2).toEqual(`http://localhost:5000/#/invitations/${undefined}`)
})

test('validateInvitation()' +
  ' should get token for given invitation and sign-in with the token.', async () => {
  // prepare #1
  const invitation = 'invitation01'
  const token = 'token01'
  store.functions.results.validateInvitation = { data: { token } }

  // run #1
  const result01 = await validateInvitation(store, invitation)

  // evaluate #1
  expect(result01.status).toEqual('ok')
  expect(store.functions.inputs.validateInvitation.invitation).toEqual(invitation)
  expect(store.auth.data.signInWithCustomToken.token).toEqual(token)

  // prepare #2
  store.functions.results.validateInvitation = { data: { token: null } }
  store.functions.clear()
  store.auth.clear()

  // run #2
  const result02 = await validateInvitation(store, invitation)

  // evaluate #2
  expect(result02.status).toEqual('error')
  expect(store.auth.data.signInWithCustomToken).not.toBeDefined()
})

test('updateInvitationStatus()' +
  ' should reset the invitation of signed-in account' +
  ' if the account has one of more sign-in methods.', async () => {
  // prepare #1
  const invitation = 'invitation01'
  const updatedAt = new Date('2020-10-10T11:11:11.111111Z')
  const email = store.auth.currentUser.email
  store.state.me = {
    _ref: admin.firestore().collection('accounts').doc(store.auth.currentUser.uid),
    id: store.auth.currentUser.uid,
    invitedAs: invitation,
    updatedAt
  }
  const accountRef = store.state.me._ref
  await accountRef.set({
    invitedAs: invitation,
    updatedAt
  })
  store.auth.currentUser.email = null

  // run #1
  await updateInvitationStatus(store)

  // evaluate #1
  expect((await accountRef.get()).data().invitedAs).toEqual(invitation)

  // prepare #2
  store.auth.currentUser.email = email

  // run #2
  await updateInvitationStatus(store)

  // evaluate #2
  expect((await accountRef.get()).data().invitedAs).toBeNull()

  // prepare #3
  await accountRef.update({
    email: null,
    invitedAs: invitation,
    updatedAt
  })
  store.auth.currentUser.email = null
  store.auth.currentUser.providerData = [{ id: 'any' }]

  // run #3
  await updateInvitationStatus(store)

  // evaluate #3
  expect((await accountRef.get()).data().invitedAs).toBeNull()

  // prepare #4
  await accountRef.update({
    email: null,
    invitedAs: invitation,
    updatedAt
  })
  store.auth.currentUser.email = null
  store.auth.currentUser.providerData = []

  // run #4
  await updateInvitationStatus(store)

  // evaluate #4
  expect((await accountRef.get()).data().invitedAs).toEqual(invitation)

  // prepare #5
  await accountRef.update({
    email: null,
    invitedAs: invitation,
    updatedAt
  })
  store.auth.currentUser.email = null
  store.auth.currentUser.providerData = []
  store.state.me.line_me = 'id of line.me'

  // run #5
  await updateInvitationStatus(store)

  // evaluate #5
  expect((await accountRef.get()).data().invitedAs).toBeNull()

  // prepare #6
  await accountRef.update({
    email: null,
    invitedAs: invitation,
    updatedAt
  })
  store.auth.currentUser.email = null
  store.auth.currentUser.providerData = []
  store.state.me.line_me = null
  store.state.me.yahoo_co_jp = 'id of yahoo.co.jp'

  // run #6
  await updateInvitationStatus(store)

  // evaluate #6
  expect((await accountRef.get()).data().invitedAs).toBeNull()

  // prepare #6
  await accountRef.update({
    email: null,
    invitedAs: invitation,
    updatedAt
  })
  store.auth.currentUser.email = null
  store.auth.currentUser.providerData = []
  store.state.me.yahoo_co_jp = null
  store.state.me.mixi_jp = 'id of mixi.jp'

  // run #6
  await updateInvitationStatus(store)

  // evaluate #6
  expect((await accountRef.get()).data().invitedAs).toBeNull()

  // evaluate #6
  expect((await accountRef.get()).data().invitedAs).toBeNull()

  // prepare #7
  await accountRef.update({
    email: null,
    invitedAs: null,
    updatedAt
  })
  store.state.me.invitedAs = null

  // run #7
  await updateInvitationStatus(store)

  // evaluate #7
  expect(
    (await accountRef.get()).data().updatedAt.toDate().toISOString()
  ).toEqual(updatedAt.toISOString())
})
