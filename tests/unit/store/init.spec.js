import {
  firebase,
  root,
  deleteApp,
  store
} from '../utils'
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
  expect(store.icon).toBeDefined()
  expect(store.withTz).toBeDefined()
  expect(store.myName).toBeDefined()
  expect(store.priv).toBeDefined()

  store.state.tz = 'Asia/Tokyo'
  expect(store.withTz('2020-12-21T01:23:45.123Z')
    .format('YYYY-MM-DDTHH:mm:ss.SSSZ')).toEqual('2020-12-21T10:23:45.123+09:00')

  expect(store.myName.value).toEqual('Guest')
  store.state.me = { id: 'myId' }
  store.state.users = [{ id: store.state.me.id, name: 'My Name' }]
  expect(store.myName.value).toEqual('My Name')

  expect(store.priv.value.user).toBeFalsy()
  store.state.me = { id: 'myId', valid: true }
  expect(store.priv.value.user).toBeTruthy()
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
