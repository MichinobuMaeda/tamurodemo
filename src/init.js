import { computed, provide, reactive } from '@vue/composition-api'
import moment from 'moment-timezone'
import { firebase, db, functions, auth } from '@/plugins/firebase'
import {
  StoreSymbol, accountPriv,
  topUrl, signInUrl, simplifyDoc, getById,
  restoreRequestedEmail, eraseRequestedEmail, restoreRequestedRoute
} from '@/helpers'

const defaultsKeys = ['darkTheme', 'menuPosition', 'locale', 'tz']

const clearServiceData = state => {
  state.service = {}
}

const clearUserData = state => {
  state.unsubscribers = state.unsubscribers || {}
  Object.keys(state.unsubscribers).forEach(key => {
    state.unsubscribers[key]()
  })
  state.unsubscribers = {}
  state.me = {}
  state.accounts = []
  state.users = []
  state.profiles = []
  state.groups = []
  state.categories = []
  state.invitations = {}
  state.waitProc = null
}

const createState = () => {
  const state = {}
  clearServiceData(state)
  clearUserData(state)
  state.myName = computed(() => getById(state.users, state.me.id).name || 'Guest')
  return reactive(state)
}

export const createStore = () => {
  const state = createState()
  const tz = state =>
    (state.me && state.me.valid && state.me.tz) ||
    (state.service.defaults && state.service.defaults.tz) ||
    'UTC'
  const store = {
    state,
    firebase,
    db,
    functions,
    auth,
    priv: computed(() => accountPriv(state.service, state.groups, state.me)),
    sortedGroups: state => state.categories
      .filter(category => !category.deletedAt)
      .reduce((ret, cur) => [
        ...ret,
        ...state.groups.filter(group => !group.deletedAt && (cur.groups || []).includes(group.id))
      ], []),
    tz: computed(() => tz(state)),
    add: (collection, data) => setProcForWait(state)(() => add(db, collection, data)),
    set: (collection, id, data) => setProcForWait(state)(() => set(db, collection, id, data)),
    del: (collection, id) => setProcForWait(state)(() => del(db, collection, id)),
    restore: (collection, id) => setProcForWait(state)(() => restore(db, collection, id)),
    setProcForWait: setProcForWait(state)
  }
  store.withTz = date => moment(date).tz(tz(state))
  defaultsKeys.forEach(key => {
    store[key] = computed(() => getDefault(state, key))
  })
  provide(StoreSymbol, store)
  return store
}

export const syncServiceData = async ({ db, state }, root) => {
  const querySnapshot = await db.collection('service').get()
  onServiceUpdate(state, root, querySnapshot)

  db.collection('service').onSnapshot(
    querySnapshot => onServiceUpdate(state, root, querySnapshot)
  )
}

export const syncUserData = async ({ db, auth, state }, root, page) => {
  // state.authMessage = window.localStorage.getItem('tamuroAuthMessage') || ''
  auth.onAuthStateChanged(async user => {
    if (auth.isSignInWithEmailLink(window.location.href)) {
      await onSignInWithEmailLink(auth)
    } else if (user) {
      const me = await db.collection('accounts').doc(user.uid).get()
      if (me && me.exists && me.data().valid) {
        await onValidAccount(db, auth, state, root, me)
      } else {
        await onInvalidAccount(auth)
      }
    } else {
      onSignOut(state)
    }
    setTimeout(() => { page.loading = false }, 500)
  })
}

export const setProcForWait = state => async (proc, next = null) => {
  console.log('setProcForWait')
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

const add = (db, collection, data) => {
  const ts = new Date()
  return db.collection(collection)
    .add({
      ...data,
      createdAt: ts,
      updatedAt: ts
    })
}

const set = (db, collection, id, data) => db.collection(collection)
  .doc(id).update({
    ...data,
    updatedAt: new Date()
  })

const del = (db, collection, id) => db.collection(collection)
  .doc(id).update({
    deletedAt: new Date()
  })

const restore = (db, collection, id) => db.collection(collection)
  .doc(id).update({
    deletedAt: null
  })

const onServiceUpdate = (state, root, querySnapshot) => {
  const service = {}
  querySnapshot.forEach(doc => {
    const { id, ...data } = simplifyDoc(doc)
    service[id] = data
  })
  state.service = service
  setDefaults(state, root)
}

const onSignInWithEmailLink = async auth => {
  const email = restoreRequestedEmail()
  eraseRequestedEmail()
  // window.localStorage.setItem('tamuroAuthMessage', '')
  if (email) {
    await auth.signInWithEmailLink(
      email,
      window.location.href
    )
  }
  window.location.href = topUrl()
}

const onValidAccount = async (db, auth, state, root, me) => {
  state.authMessage = ''
  // window.localStorage.setItem('tamuroAuthMessage', '')
  state.me = simplifyDoc(me)
  setDefaults(state, root, auth)
  await db.collection('accounts').doc(state.me.id).update({
    signedInAt: new Date()
  })

  await getInitialAndRealtimeData(
    state,
    'groups',
    db.collection('groups').orderBy('name', 'asc')
  )
  await getInitialAndRealtimeData(
    state,
    'categories',
    db.collection('categories').orderBy('seq', 'asc')
  )
  await getInitialAndRealtimeData(
    state,
    'users',
    db.collection('users').orderBy('name', 'asc')
  )
  const priv = accountPriv(state.service, state.groups, state.me)
  if (priv.admin || priv.manager) {
    await getInitialAndRealtimeData(
      state,
      'accounts',
      db.collection('accounts'),
      (state) => {
        state.me = getById(state.accounts, state.me.id)
        setDefaults(state, root, auth)
      }
    )
  } else {
    const meRef = db.collection('accounts').doc(state.me.id)
    state.accounts = [simplifyDoc(await meRef.get())]
    state.unsubscribers.accounts = meRef.onSnapshot(me => {
      state.accounts = [simplifyDoc(me)]
      state.me = simplifyDoc(me)
      setDefaults(state, root, auth)
    })
  }
  if (accountPriv(state.service, state.groups, state.me).manager) {
    await getInitialAndRealtimeData(
      state,
      'profiles',
      db.collection('profiles'))
  } else {
    const meRef = db.collection('profiles').doc(state.me.id)
    state.profiles = [simplifyDoc(await meRef.get())]
    state.unsubscribers.profiles = meRef.onSnapshot(me => {
      state.profiles = [simplifyDoc(me)]
    })
  }

  if (!['invitation', 'policy'].includes(root.$route.name)) {
    if (state.me.invitedAs &&
      (
        auth.currentUser.email ||
        (auth.currentUser.providerData && auth.currentUser.providerData.length) ||
        state.me.line ||
        state.me.yahooJapan ||
        state.me.mixi
      )
    ) {
      await db.collection('accounts').doc(state.me.id).update({
        invitedAs: null
      })
    }
    const requestedRoute = restoreRequestedRoute()
    if (requestedRoute) {
      root.$router.push(requestedRoute).catch(() => {})
    }
  }
}

const onInvalidAccount = async auth => {
  await auth.signOut()
  window.location.href = signInUrl()
}

const onSignOut = state => {
  clearUserData(state)
}

const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
  const priv = accountPriv(state.service, state.groups, state.me)
  state[propName] = (await queryRef.get()).docs
    .filter(doc => priv.admin || priv.manager || !doc.data().deletedAt)
    .map(doc => simplifyDoc(doc))
  onChange && onChange(state)
  state.unsubscribers[propName] = queryRef.onSnapshot(querySnapshot => {
    const priv = accountPriv(state.service, state.groups, state.me)
    state[propName] = querySnapshot.docs
      .filter(doc => priv.admin || priv.manager || !doc.data().deletedAt)
      .map(doc => simplifyDoc(doc))
    onChange && onChange(state)
  })
}

const setDefaults = (state, root, auth = null) => {
  root.$vuetify.theme.dark = getDefault(state, 'darkTheme')
  root.$i18n.locale = getDefault(state, 'locale')
  const lang = getDefault(state, 'locale').replace(/_.+/, '')
  moment.locale(lang)
  if (auth) {
    auth.languageCode = lang
  }
}

const getDefault = (state, key) => accountPriv(state.service, state.groups, state.me).user
  ? state.me[key]
  : state.service.defaults
    ? state.service.defaults[key]
    : null
