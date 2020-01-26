import store from '../../src/store'
import conf from  '../../src/conf'

beforeEach(() => {
  store.replaceState({
    ...store.state,
    layoutSize: {},
    reqPage: null,
    loading: [ 'start' ],
    message: { key: 'noMessage', params: {} },
    me: null,
    groups: [],
    chatRooms: {},
    chatImages: {},
    messages: {},
    accounts: [],
    users: [],
    profiles: {},
    service: {},
    unsub: {},
    preferences: {},
    limitedPriv: false
  })
})

test('getter.conf is conf object.', () => {
  expect(store.getters.conf).toEqual(conf)
})

test('getter.isTab is that the layout width is to show tab.', () => {
  expect(store.getters.isTab).toBeFalsy()

  store.commit('setLayoutSize', {
    width: store.getters.conf.styles.showTabMaxWidth - 1
  })
  expect(store.getters.isTab).toBeTruthy()

  store.commit('setLayoutSize', {
    width: store.getters.conf.styles.showTabMaxWidth
  })
  expect(store.getters.isTab).toBeFalsy()
})

test('getter.menuPosition is the system defaut or user chosen value.', () => {
  expect(store.getters.menuPosition).toBeNull()

  store.commit('setMenuPosition', 'bottom-right')
  expect(store.getters.menuPosition).toEqual('bottom-right')

  store.commit('setMe', {
    id: 'test-id',
    exists: true,
    data: () => ({
      name: 'test-name',
      menuPosition: 'bottom-left',
      valid: true
    })
  })
  expect(store.getters.menuPosition).toEqual('bottom-left')
})

test('getter.locale is the system defaut or user chosen value.', () => {
  expect(store.getters.locale).toBeNull()

  store.commit('setPreferences', { locale: 'de' })
  expect(store.getters.locale).toEqual('de')

  store.commit('setMe', {
    id: 'test-id',
    exists: true,
    data: () => ({
      name: 'test-name',
      locale: 'en',
      valid: true
    })
  })
  expect(store.getters.locale).toEqual('en')
})

test('getter.timezone is the system defaut or user chosen value.', () => {
  expect(store.getters.timezone).toBeNull()

  store.commit('setPreferences', { timezone: 'Europe/Berlin' })
  expect(store.getters.timezone).toEqual('Europe/Berlin')

  store.commit('setMe', {
    id: 'test-id',
    exists: true,
    data: () => ({
      name: 'test-name',
      timezone: 'America/Los_Angeles',
      valid: true
    })
  })
  expect(store.getters.timezone).toEqual('America/Los_Angeles')
})

test('getter.me is valid account signed in', () => {
  store.commit('resetMe')
  expect(store.getters.me).toBeNull()

  store.commit('setMe', {
    id: 'test-id',
    exists: true,
    data: () => ({
      name: 'test-name',
      valid: true
    })
  })
  expect(store.getters.me).toEqual({
    id: 'test-id',
    name: 'test-name',
    valid: true
  })

  store.commit('resetMe')
  expect(store.getters.me).toBeNull()

  store.commit('setMe', {
    id: 'test-id',
    exists: false,
    data: () => ({
      name: 'test-name',
      valid: true
    })
  })
  expect(store.getters.me).toBeNull()

  store.commit('setMe', {
    id: 'test-id',
    exists: true,
    data: () => ({
      name: 'test-name',
      valid: false
    })
  })
  expect(store.getters.me).toBeNull()
})

test('getter.groups is the list of groups', () => {
  expect(store.getters.groups).toEqual([])

  store.commit('setGroups', {
    docs: [
      {
        id: 'group1',
        data: () => ({
          name: 'Group 1'
        })
      },
      {
        id: 'group2',
        data: () => ({
          name: 'Group 2'
        })
      }
    ]
  })
  expect(store.getters.groups).toEqual([
    {
      id: 'group1',
      name: 'Group 1'
    },
    {
      id: 'group2',
      name: 'Group 2'
    }
  ])

  store.commit('resetGroups')
  expect(store.getters.groups).toEqual([])
})

test('getter.group is the group of given id', () => {
  expect(store.getters.group('group1')).toEqual({})

  store.commit('setGroups', {
    docs: [
      {
        id: 'group1',
        data: () => ({
          name: 'Group 1'
        })
      },
      {
        id: 'group2',
        data: () => ({
          name: 'Group 2'
        })
      }
    ]
  })
  expect(store.getters.group('group2')).toEqual({
    id: 'group2',
    name: 'Group 2'
  })
  expect(store.getters.group('group3')).toEqual({})
})

test('getter.users is the list of users', () => {
  expect(store.getters.users).toEqual([])

  store.commit('setUsers', {
    docChanges: () => ([
      {
        type: 'added',
        doc: {
          id: 'user1',
          data: () => ({
            name: 'User 1'
          })
        }
      },
      {
        type: 'modified',
        doc: {
          id: 'user2',
          data: () => ({
            name: 'User 2'
          })
        }
      },
      {
        type: 'removed',
        doc: {
          id: 'user3',
          data: () => ({
            name: 'User 3'
          })
        }
      }
    ])
  })
  expect(store.getters.users).toEqual([
    {
      id: 'user1',
      name: 'User 1'
    },
    {
      id: 'user2',
      name: 'User 2'
    }
  ])

  store.commit('resetUsers')
  expect(store.getters.users).toEqual([])
})

test('getter.user is the user of given id', () => {
  expect(store.getters.user('user1')).toEqual({})

  store.commit('setUsers', {
    docChanges: () => ([
      {
        type: 'added',
        doc: {
          id: 'user1',
          data: () => ({
            name: 'User 1'
          })
        }
      },
      {
        type: 'modified',
        doc: {
          id: 'user2',
          data: () => ({
            name: 'User 2'
          })
        }
      },
      {
        type: 'removed',
        doc: {
          id: 'user3',
          data: () => ({
            name: 'User 3'
          })
        }
      }
    ])
  })
  expect(store.getters.user('user2')).toEqual({
    id: 'user2',
    name: 'User 2'
  })
  expect(store.getters.user('user3')).toEqual({})
})

test('getter.accounts is the list of accounts', () => {
  expect(store.getters.accounts).toEqual([])

  store.commit('setAccounts', {
    docs: [
      {
        id: 'account1',
        data: () => ({
          name: 'Account 1'
        })
      },
      {
        id: 'account2',
        data: () => ({
          name: 'Account 2'
        })
      }
    ]
  })
  expect(store.getters.accounts).toEqual([
    {
      id: 'account1',
      name: 'Account 1'
    },
    {
      id: 'account2',
      name: 'Account 2'
    }
  ])

  store.commit('resetAccounts')
  expect(store.getters.accounts).toEqual([])
})

test('getter.account is the account of given id', () => {
  expect(store.getters.account('account1')).toEqual({})

  store.commit('setAccounts', {
    docs: [
      {
        id: 'account1',
        data: () => ({
          name: 'Account 1'
        })
      },
      {
        id: 'account2',
        data: () => ({
          name: 'Account 2'
        })
      }
    ]
  })
  expect(store.getters.account('account2')).toEqual({
    id: 'account2',
    name: 'Account 2'
  })
  expect(store.getters.account('account3')).toEqual({})
})

test('getter.accountStatus is one of "accepted", "invited", "blocked"', () => {
  expect(store.getters.accountStatus('account1')).toEqual('blocked')

  store.commit('setAccounts', {
    docs: [
      {
        id: 'account1',
        data: () => ({
          name: 'Account 1',
          valid: true,
          invitedAt: new Date(),
          enteredAt: new Date()
        })
      },
      {
        id: 'account2',
        data: () => ({
          name: 'Account 2',
          valid: true,
          invitedAt: new Date(),
        })
      },
      {
        id: 'account3',
        data: () => ({
          name: 'Account 3',
          valid: true
        })
      },
      {
        id: 'account4',
        data: () => ({
          name: 'Account 4',
          valid: false,
          invitedAt: new Date(),
          enteredAt: new Date()
        })
      },
      {
        id: 'account5',
        data: () => ({
          name: 'Account 5',
          valid: false,
          invitedAt: new Date(),
        })
      },
      {
        id: 'account6',
        data: () => ({
          name: 'Account 6',
          valid: false
        })
      }
    ]
  })
  expect(store.getters.accountStatus('account1')).toEqual('accepted')
  expect(store.getters.accountStatus('account2')).toEqual('invited')
  expect(store.getters.accountStatus('account3')).toEqual('blocked')
  expect(store.getters.accountStatus('account4')).toEqual('blocked')
  expect(store.getters.accountStatus('account5')).toEqual('blocked')
  expect(store.getters.accountStatus('account6')).toEqual('blocked')
  expect(store.getters.accountStatus('account7')).toEqual('blocked')
})
