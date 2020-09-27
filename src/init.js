import { computed, provide, reactive } from '@vue/composition-api'
import * as firebase from '@/plugins/firebase'
import { StoreSymbol, getMyPriv, getMyName,
  topUrl, signInUrl, simplifyDoc, getById,
  restoreRequestedEmail, eraseRequestedEmail
} from '@/helpers'

const defaultsKeys = ['menuPosition', 'locale', 'tz']

export const createStore = () => {
  const state = {}
  clearServiceData(state)
  clearUserData(state)
  const store = {
    state: reactive(state),
    ...firebase,
    updateStore: updateStore(firebase.db)
  }
  store.priv = computed(() => getMyPriv(store.state))
  store.myName = computed(() => getMyName(store.state))
  provide(StoreSymbol, store)
  return store
}

export const syncServiceData = async ({ db, state }) => {
  const querySnapshot = await db.collection('service').get()
  onServiceUpdate(state, querySnapshot)
  db.collection('service').onSnapshot(
    querySnapshot => onServiceUpdate(state, querySnapshot)
  )
}

export const syncUserData = async ({ db, auth, state }, page) => {

  // state.authMessage = window.localStorage.getItem('tamuroAuthMessage') || ''
  auth.onAuthStateChanged(async user => {
    if (auth.isSignInWithEmailLink(window.location.href)) {
      await onSignInWithEmailLink(auth)
    } else if (user) {
      const me = await db.collection('accounts').doc(user.uid).get()
      if (me && me.exists && me.data().valid) {
        await onValidAccount(db, auth, state, me)
      } else {
        await onInvalidAccount(auth)
      }
    } else {
      onSighOut(state)
    }
    setTimeout(() => { page.loading = false }, 500)
  })
}

const updateStore = db => (collection, id, data) => db.collection(collection)
  .doc(id).update({
    ...data,
    updatedAt: new Date()
  })

const clearServiceData = state => {
  state.service = {}
  state.menuPosition = 'br'
  state.locale = 'ja_JP'
  state.tz = 'Asia/Tokyo'
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
}

const onServiceUpdate = (state, querySnapshot) => {
  const service = {}
  querySnapshot.forEach(doc => service[doc.id] = doc.data())
  state.service = service
  if (state.service.defaults) {
    defaultsKeys.forEach(key => { state[key] = state.service.defaults[key] || state[key] })
  }
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

const onValidAccount = async (db, auth, state, me) => {
  state.authMessage = ''
  // window.localStorage.setItem('tamuroAuthMessage', '')
  state.me = simplifyDoc(me)
  defaultsKeys.forEach(key => { state[key] = state.me[key] || state[key] })

  await getInitialAndRealtimeData(
    state,
    'groups',
    db.collection('groups').orderBy('name', 'asc')
  )
  await getInitialAndRealtimeData(
    state,
    'users',
    db.collection('users').orderBy('name', 'asc')
  )
  if (getMyPriv(state).admin || getMyPriv(state).manager) {
    await getInitialAndRealtimeData(
      state,
      'accounts',
      db.collection('accounts'),
      (state) => {
        state.me = getById(state.accounts, state.me.id)
      }
    )
  } else {
    const meRef = db.collection('accounts').doc(state.me.id)
    state.accounts = [simplifyDoc(await meRef.get())]
    state.unsubscribers.accounts = meRef.onSnapshot(me => {
      state.accounts = [simplifyDoc(me)]
      state.me = simplifyDoc(me)
    })
  }
  if (getMyPriv(state).manager) {
    await getInitialAndRealtimeData(
      state,
      'profiles',
      db.collection('profiles')    )
  } else {
    const meRef = db.collection('profiles').doc(state.me.id)
    state.profiles = [simplifyDoc(await meRef.get())]
    state.unsubscribers.profiles = meRef.onSnapshot(me => {
      state.profiles = [simplifyDoc(me)]
    })
  }
}

const onInvalidAccount = async auth => {
  await auth.signOut()
  window.location.href = signInUrl()
}

const onSighOut = state => {
  clearUserData(state)
}

const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
  state[propName] = (await queryRef.get()).docs.map(doc => simplifyDoc(doc))
  onChange && onChange(state)
  state.unsubscribers[propName] = queryRef.onSnapshot(querySnapshot => {
    state[propName] = querySnapshot.docs.map(doc => simplifyDoc(doc))
    onChange && onChange(state)
  })
}
