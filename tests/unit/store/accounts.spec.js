import {
  deleteApp,
  store
} from '../utils'
import {
  accountIsValid,
  isMemberOf,
  accountPriv,
  myPriv,
  accountStatus
} from '../../../src/store/accounts'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
})

afterAll(async () => {
  await deleteApp()
})

test('accountIsValid()' +
  ' should return the given account is valid user.', async () => {
  expect(accountIsValid()).toBeFalsy()
  expect(accountIsValid(null)).toBeFalsy()
  expect(accountIsValid({})).toBeFalsy()
  expect(accountIsValid({ id: 'id0001' })).toBeFalsy()
  expect(accountIsValid({ id: 'id0001', valid: false })).toBeFalsy()
  expect(accountIsValid({ id: 'id0001', valid: true })).toBeTruthy()
  expect(accountIsValid({ id: 'id0001', valid: true, deletedAt: null })).toBeTruthy()
  expect(accountIsValid({ id: 'id0001', valid: true, deletedAt: new Date() })).toBeFalsy()
})

test('isMemberOf()' +
  ' should return given account is a member of given group.', async () => {
  expect(isMemberOf({ id: 'id0001' }, { members: ['id0001'] })).toBeTruthy()
  expect(isMemberOf({ id: 'id0001' }, { members: ['id0001', 'id0002'] })).toBeTruthy()
  expect(isMemberOf({}, { members: ['id0001'] })).toBeFalsy()
  expect(isMemberOf(null, { members: ['id0001'] })).toBeFalsy()
  expect(isMemberOf(undefined, { members: ['id0001'] })).toBeFalsy()
  expect(isMemberOf({ id: 'id0001' }, { members: [] })).toBeFalsy()
  expect(isMemberOf({ id: 'id0001' }, { members: ['id0002'] })).toBeFalsy()
  expect(isMemberOf({ id: 'id0001' }, {})).toBeFalsy()
  expect(isMemberOf({ id: 'id0001' }, null)).toBeFalsy()
  expect(isMemberOf({ id: 'id0001' })).toBeFalsy()
})

test('accountPriv()' +
  ' should return the priviliges of the given account.', async () => {
  // prepare
  const TIMEOUT = 100 * 1000
  const state = {
    service: {
      conf: {
        invitationExpirationTime: TIMEOUT
      }
    },
    groups: [
      { id: 'managers', members: ['primary', 'manager'] },
      { id: 'admins', members: ['primary', 'admin'] },
      { id: 'testers', members: ['tester'] }
    ]
  }

  // run
  const guest = accountPriv(state, {})
  const deleted = accountPriv({
    id: 'id0000',
    valid: true,
    deletedAt: new Date()
  })
  const invalid = accountPriv({
    id: 'id0000',
    valid: false
  })
  const user = accountPriv(state, {
    id: 'id0001',
    valid: true
  })
  const invied = accountPriv(state, {
    id: 'id0001',
    valid: true,
    invitedAs: 'invitasion',
    invitedAt: new Date()
  })
  const exired = accountPriv(state, {
    id: 'id0001',
    valid: true,
    invitedAs: 'invitasion',
    invitedAt: new Date(new Date().getTime() - TIMEOUT - 1)
  })
  const primary = accountPriv(state, {
    id: 'primary',
    valid: true
  })
  const manager = accountPriv(state, {
    id: 'manager',
    valid: true
  })
  const admin = accountPriv(state, {
    id: 'admin',
    valid: true
  })
  const tester = accountPriv(state, {
    id: 'tester',
    valid: true
  })

  // evaluate
  expect(guest.guest).toBeTruthy()
  expect(guest.user).toBeFalsy()
  expect(guest.invited).toBeFalsy()
  expect(guest.manager).toBeFalsy()
  expect(guest.admin).toBeFalsy()
  expect(guest.tester).toBeFalsy()

  expect(deleted.guest).toBeTruthy()
  expect(deleted.user).toBeFalsy()
  expect(deleted.invited).toBeFalsy()
  expect(deleted.manager).toBeFalsy()
  expect(deleted.admin).toBeFalsy()
  expect(deleted.tester).toBeFalsy()

  expect(invalid.guest).toBeTruthy()
  expect(invalid.user).toBeFalsy()
  expect(invalid.invited).toBeFalsy()
  expect(invalid.manager).toBeFalsy()
  expect(invalid.admin).toBeFalsy()
  expect(invalid.tester).toBeFalsy()

  expect(user.guest).toBeFalsy()
  expect(user.user).toBeTruthy()
  expect(user.invited).toBeFalsy()
  expect(user.manager).toBeFalsy()
  expect(user.admin).toBeFalsy()
  expect(user.tester).toBeFalsy()

  expect(invied.guest).toBeFalsy()
  expect(invied.user).toBeTruthy()
  expect(invied.invited).toBeTruthy()
  expect(invied.manager).toBeFalsy()
  expect(invied.admin).toBeFalsy()
  expect(invied.tester).toBeFalsy()

  expect(exired.guest).toBeFalsy()
  expect(exired.user).toBeTruthy()
  expect(exired.invited).toBeFalsy()
  expect(exired.manager).toBeFalsy()
  expect(exired.admin).toBeFalsy()
  expect(exired.tester).toBeFalsy()

  expect(primary.guest).toBeFalsy()
  expect(primary.user).toBeTruthy()
  expect(primary.invited).toBeFalsy()
  expect(primary.manager).toBeTruthy()
  expect(primary.admin).toBeTruthy()
  expect(primary.tester).toBeFalsy()

  expect(manager.guest).toBeFalsy()
  expect(manager.user).toBeTruthy()
  expect(manager.invited).toBeFalsy()
  expect(manager.manager).toBeTruthy()
  expect(manager.admin).toBeFalsy()
  expect(manager.tester).toBeFalsy()

  expect(admin.guest).toBeFalsy()
  expect(admin.user).toBeTruthy()
  expect(admin.invited).toBeFalsy()
  expect(admin.manager).toBeFalsy()
  expect(admin.admin).toBeTruthy()
  expect(admin.tester).toBeFalsy()

  expect(tester.guest).toBeFalsy()
  expect(tester.user).toBeTruthy()
  expect(tester.invited).toBeFalsy()
  expect(tester.manager).toBeFalsy()
  expect(tester.admin).toBeFalsy()
  expect(tester.tester).toBeTruthy()
})

test('myPriv()' +
  ' should return the priviliges of me.', async () => {
  // prepare
  const state = {
    accounts: [
      { id: 'id0000', valid: false },
      { id: 'id0001', valid: true }
    ],
    groups: []
  }

  // run
  state.me = state.accounts.find(item => item.id === 'id0000')
  const priv1 = myPriv(state)
  state.me = state.accounts.find(item => item.id === 'id0001')
  const priv2 = myPriv(state)

  // evaluate
  expect(priv1.guest).toBeTruthy()
  expect(priv1.user).toBeFalsy()
  expect(priv2.guest).toBeFalsy()
  expect(priv2.user).toBeTruthy()
})

test('accountStatus()' +
  ' should return the status description of the given account.', async () => {
  // prepare
  const TIMEOUT = 100 * 1000
  const state = {
    service: {
      conf: {
        invitationExpirationTime: TIMEOUT
      }
    },
    groups: [],
    accounts: [
      {
        id: 'deleted2',
        valid: true,
        deletedAt: new Date()
      },
      {
        id: 'locked',
        valid: false
      },
      {
        id: 'accepted',
        valid: true,
        invitedAs: 'invitation',
        invitedAt: new Date(new Date().getTime() - 100),
        signedInAt: new Date()
      },
      {
        id: 'invited1',
        valid: true,
        invitedAs: 'invitation',
        invitedAt: new Date(),
        signedInAt: new Date(new Date().getTime() - 100)
      },
      {
        id: 'invited2',
        valid: true,
        invitedAs: 'invitation',
        invitedAt: new Date()
      },
      {
        id: 'timeouted',
        valid: true,
        invitedAs: 'invitation',
        invitedAt: new Date(new Date().getTime() - TIMEOUT - 1)
      },
      {
        id: 'active1',
        valid: true,
        invitedAs: 'invitation',
        signedInAt: new Date()
      },
      {
        id: 'inactive1',
        valid: true,
        invitedAs: 'invitation'
      },
      {
        id: 'active2',
        valid: true,
        signedInAt: new Date()
      },
      {
        id: 'inactive2',
        valid: true
      }
    ]
  }

  // run
  const deleted1 = accountStatus(state, 'deleted1')
  const deleted2 = accountStatus(state, 'deleted2')
  const locked = accountStatus(state, 'locked')
  const accepted = accountStatus(state, 'accepted')
  const invited1 = accountStatus(state, 'invited1')
  const invited2 = accountStatus(state, 'invited2')
  const timeouted = accountStatus(state, 'timeouted')
  const active1 = accountStatus(state, 'active1')
  const inactive1 = accountStatus(state, 'inactive1')
  const active2 = accountStatus(state, 'active2')
  const inactive2 = accountStatus(state, 'inactive2')

  // evaluate
  expect(deleted1).toEqual('Account deleted')
  expect(deleted2).toEqual('Account deleted')
  expect(locked).toEqual('Account locked')
  expect(accepted).toEqual('Invitation accepted')
  expect(invited1).toEqual('Invited')
  expect(invited2).toEqual('Invited')
  expect(timeouted).toEqual('Invitation timeout')
  expect(active1).toEqual('Account active')
  expect(inactive1).toEqual('Account inactive')
  expect(active2).toEqual('Account active')
  expect(inactive2).toEqual('Account inactive')
})
