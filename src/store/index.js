import { computed, provide, reactive } from '@vue/composition-api'
import moment from 'moment-timezone'
import { clearServiceData, clearUserData } from './state'
import * as firebase from '@/plugins/firebase'
import { myPriv } from '@/auth'
import { StoreSymbol, getById, storeRequestedRoute } from '@/utils'
import * as conf from '@/conf'

export * from './state'
export * from './menuItems'

export const createStore = root => {
  const { db } = firebase

  const state = reactive(clearUserData(clearServiceData({
    ...conf.defaults,
    loading: true
  })))
  const store = {
    state,
    ...firebase,
    ...conf,
    myName: computed(() => getById(state.users, state.me.id).name || 'Guest'),
    priv: computed(() => myPriv(state)),
    ...conf.validators(state, root)
  }

  store.sortedGroups = state => state.categories
    .filter(category => !category.deletedAt)
    .reduce((ret, cur) => [
      ...ret,
      ...state.groups.filter(group => !group.deletedAt && (cur.groups || []).includes(group.id))
    ], [])

  store.setProcForWait = setProcForWait(state)
  store.add = add(db)
  store.update = update(db)
  store.remove = remove(db)
  store.restore = restore(db)
  store.waitForAdd = (collection, data) => store.setProcForWait(() => store.add(collection, data))
  store.waitForUpdate = (collection, id, data) => store.setProcForWait(() => store.update(collection, id, data))
  store.waitForRemove = (collection, id) => store.setProcForWait(() => store.remove(collection, id))
  store.waitForRestore = (collection, id) => store.setProcForWait(() => store.restore(collection, id))

  store.goPage = goPage(root.$router)
  store.goPageGroup = id => store.goPage({ name: 'group', params: { id } })
  store.goPageUser = (id, edit = false) => store.goPage({ name: 'user', params: { id, mode: (edit ? 'edit' : null) } })

  overrideDefaults(store, root)
  store.withTz = date => moment(date).tz(state.tz)

  provide(StoreSymbol, store)
  return store
}

const setProcForWait = state => async (proc, next = null) => {
  const ts = new Date().getTime()
  state.waitProc = ts
  setTimeout(
    () => {
      if (state.waitProc === ts) {
        state.waitProc = null
      }
    },
    10 * 1000
  )
  try {
    const ret = await proc()
    if (next) { await next() }
    return ret
  } finally {
    state.waitProc = null
  }
}

const add = db => (collection, data) => {
  const ts = new Date()
  return db.collection(collection)
    .add({
      ...data,
      createdAt: ts,
      updatedAt: ts
    })
}

const update = db => (collection, id, data) => db.collection(collection)
  .doc(id).update({
    ...data,
    updatedAt: new Date()
  })

const remove = db => (collection, id) => db.collection(collection)
  .doc(id).update({
    deletedAt: new Date()
  })

const restore = db => (collection, id) => db.collection(collection)
  .doc(id).update({
    deletedAt: null
  })

const goPage = router => route => {
  if (![
    'invitation',
    'signin',
    'policy',
    'preferences'
  ].includes(route.name)) {
    storeRequestedRoute(route)
  }
  router.push(route).catch(() => {})
}

export const overrideDefaults = (store, root) => {
  const { state, auth, locales, defaults } = store
  Object.keys(defaults).forEach(key => {
    state[key] = myPriv(state).user
      ? state.me[key]
      : state.service.defaults
        ? state.service.defaults[key]
        : defaults[key]
  })
  root.$vuetify.theme.dark = state.darkTheme
  root.$i18n.locale = state.locale
  const lang = locales.find(item => item.value === state.locale).lang
  moment.locale(lang)
  auth.languageCode = lang
}
