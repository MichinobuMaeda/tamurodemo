import {
  firebase,
  root,
  deleteApp,
  store
} from '../_testUtils'
import { defaults } from '../../../src/conf'
import {
  useStore,
  overrideDefaults,
  createStore
} from '../../../src/store/init'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
})

afterAll(async () => {
  await deleteApp()
})

test('useStore()' +
  ' should return nothing without vue module context.', async () => {
  // prepare

  // run
  const ret = await useStore()

  // evaluate
  expect(ret).not.toBeDefined()
})

test('createStore()' +
  ' should return store with empty attibutes.', async () => {
  // prepare

  // run
  const store = await createStore(firebase, root)

  // evaluate
  expect(store.state).toBeDefined()
  expect(store.db).toBeDefined()
  expect(store.auth).toBeDefined()
  expect(store.functions).toBeDefined()
  expect(store.conf).toBeDefined()
  expect(store.withTz).toBeDefined()
  expect(store.me).toBeDefined()
  expect(store.account).toBeDefined()
  expect(store.user).toBeDefined()
  expect(store.profile).toBeDefined()
  expect(store.group).toBeDefined()
  expect(store.category).toBeDefined()

  store.state.tz = 'Asia/Tokyo'
  expect(store.withTz('2020-12-21T01:23:45.123Z')
    .format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toEqual('2020-12-21T10:23:45.123+09:00')

  expect(store.me.value.name).toEqual('Unknown')

  store.state.groups = [
    { id: 'group01', name: 'Group 01', members: ['account01'] },
    { id: 'group02', name: 'Group 02', members: [] }
  ]
  store.state.accounts = [
    { id: 'account01' },
    { id: 'account02' }
  ]
  store.state.me = { ...store.state.accounts[0] }
  store.state.users = [
    { id: 'account01', name: 'User 01' },
    { id: 'account02', name: 'User 02' }
  ]
  expect(store.me.value.name).toEqual('User 01')
  expect(store.me.value.status).toEqual('Account locked')
  expect(store.me.value.groups).toHaveLength(2)
  expect(store.me.value.priv.user).toBeFalsy()
  expect(store.account('account02').name).toEqual('User 02')
  expect(store.account('account02').status).toEqual('Account locked')
  expect(store.account('account02').groups).toHaveLength(1)
  expect(store.account('account02').priv.user).toBeFalsy()

  store.state.accounts[0] = { id: 'account01', valid: true }
  store.state.accounts[1] = { id: 'account02', valid: true }
  store.state.me = { ...store.state.accounts[0] }
  expect(store.me.value.priv.user).toBeTruthy()
  expect(store.account('account02').priv.user).toBeTruthy()

  expect(store.user('account01').name).toEqual('User 01')
  expect(store.profile('account01').name).toBeUndefined()
  expect(store.group('group01').name).toEqual('Group 01')
  expect(store.category('category01').name).toBeUndefined()
})

test('overrideDefaults()' +
  ' should set conf.defaults without service.defaults nor me.', async () => {
  // prepare

  // run
  overrideDefaults(store, root)

  // evaluate
  expect(store.state.chatSummaryExpand).toEqual(defaults.chatSummaryExpand)
  expect(store.state.darkTheme).toEqual(defaults.darkTheme)
  expect(store.state.locale).toEqual(defaults.locale)
  expect(store.state.menuPosition).toEqual(defaults.menuPosition)
  expect(store.state.tz).toEqual(defaults.tz)
  expect(root.$vuetify.theme.dark).toEqual(defaults.darkTheme)
  expect(root.$i18n.locale).toEqual(defaults.locale)
})

test('overrideDefaults()' +
  ' should set conf.defaults with service.defaults without me.', async () => {
  // prepare
  store.state.service.defaults = {
    chatSummaryExpand: false,
    darkTheme: true,
    locale: 'ja_JP',
    menuPosition: 'bl',
    tz: 'Asia/Osaka'
  }

  // run
  overrideDefaults(store, root)

  // evaluate
  expect(store.state.chatSummaryExpand).toEqual(store.state.service.defaults.chatSummaryExpand)
  expect(store.state.darkTheme).toEqual(store.state.service.defaults.darkTheme)
  expect(store.state.locale).toEqual(store.state.service.defaults.locale)
  expect(store.state.menuPosition).toEqual(store.state.service.defaults.menuPosition)
  expect(store.state.tz).toEqual(store.state.service.defaults.tz)
  expect(root.$vuetify.theme.dark).toEqual(store.state.service.defaults.darkTheme)
  expect(root.$i18n.locale).toEqual(store.state.service.defaults.locale)
  expect(firebase.auth.languageCode).toEqual('ja')
})

test('overrideDefaults()' +
  ' should set conf.defaults with service.defaults without me.', async () => {
  // prepare
  store.state.service.defaults = defaults
  store.state.me = {
    id: 'myid',
    valid: true,
    chatSummaryExpand: false,
    darkTheme: true,
    locale: 'ja_JP',
    menuPosition: 'bl',
    tz: 'Asia/Osaka'
  }

  // run
  overrideDefaults(store, root)

  // evaluate
  expect(store.state.chatSummaryExpand).toEqual(store.state.me.chatSummaryExpand)
  expect(store.state.darkTheme).toEqual(store.state.me.darkTheme)
  expect(store.state.locale).toEqual(store.state.me.locale)
  expect(store.state.menuPosition).toEqual(store.state.me.menuPosition)
  expect(store.state.tz).toEqual(store.state.me.tz)
  expect(root.$vuetify.theme.dark).toEqual(store.state.me.darkTheme)
  expect(root.$i18n.locale).toEqual(store.state.me.locale)
  expect(firebase.auth.languageCode).toEqual('ja')
})
