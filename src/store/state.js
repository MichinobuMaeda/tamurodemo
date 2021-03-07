import { providers } from '../conf'
import { accountPriv } from './accounts'
import { castDoc } from './firestore'

export const clearServiceData = (state = {}) => {
  state.service = {}
  return state
}

export const unsubscribeAll = state => {
  if (state.unsubscribers) {
    Object.keys(state.unsubscribers).forEach(key => {
      state.unsubscribers[key]()
    })
  }
  state.unsubscribers = {}
}

export const clearUserData = state => {
  unsubscribeAll(state)
  state.me = {}
  state.accounts = []
  state.users = []
  state.profiles = []
  state.groups = []
  state.groupChats = {}
  state.hotlines = {}
  state.images = {}
  state.categories = []
  state.invitations = {}
  state.route = {}
  state.secrets = {}
  state.waitProc = null
  return state
}

export const initServiceData = async ({ db, state }) => {
  const onServiceUpdate = (querySnapshot) => {
    const service = {}
    querySnapshot.forEach(doc => {
      const { id, ...data } = castDoc(doc)
      service[id] = data
    })
    state.service = service
  }
  const querySnapshot = await db.collection('service').get()
  onServiceUpdate(querySnapshot)
  return db.collection('service').onSnapshot(
    querySnapshot => onServiceUpdate(querySnapshot)
  )
}

export const updateMe = ({ auth, state }, doc = null) => {
  const providerStatus = providers.reduce((ret, cur) => ({ ...ret, [cur.key]: false }), {})
  state.me = {
    ...providerStatus,
    ...doc || state.me,
    ...((auth.currentUser && auth.currentUser.providerData) || [])
      .reduce(
        (ret, cur) => cur.providerId ? { ...ret, [cur.providerId.replace(/\./g, '_')]: true } : ret,
        {}
      )
  }
}

export const initMe = async ({ db, auth, state }, id) => {
  const doc = await db.collection('accounts').doc(id).get()
  if (!doc || !doc.exists) {
    throw new Error(`failed to get account:${id}`)
  }
  updateMe({ auth, state }, castDoc(doc))
}

export const initUserData = async ({ db, auth, state }) => {
  state.loading = true
  unsubscribeAll(state)
  state.authMessage = ''

  getRealtimeData(
    state,
    'users',
    db.collection('users').orderBy('name', 'asc')
  )
  await getInitialAndRealtimeData(
    state,
    'groups',
    db.collection('groups').orderBy('name', 'asc')
  )
  getRealtimeData(
    state,
    'categories',
    db.collection('categories').orderBy('seq', 'asc')
  )
  const priv = accountPriv(state, state.me)
  getRealtimeData(
    state,
    'accounts',
    (priv.adminReal || priv.managerReal) ? db.collection('accounts') : db.collection('accounts').doc(state.me.id),
    state => updateMe({ auth, state }, findItem(state.accounts, state.me.id))
  )
  getRealtimeData(
    state,
    'profiles',
    priv.managerReal ? db.collection('profiles') : db.collection('profiles').doc(state.me.id)
  )
  if (priv.adminReal) {
    const secrets = {}
    state.unsubscribers.secrets = db.collection('secrets')
      .onSnapshot(snapshot => snapshot.forEach(doc => {
        const { id, ...data } = castDoc(doc)
        secrets[id] = data
      }))
    state.secrets = secrets
  }
  state.loading = false
  await db.collection('accounts').doc(state.me.id).update({
    signedInAt: new Date()
  })
}

const castSnapshot = (state, snapshot) => {
  const priv = accountPriv(state, state.me)
  return snapshot.docs
    ? snapshot.docs
      .filter(doc => priv.adminReal || priv.managerReal || !doc.data().deletedAt)
      .map(doc => castDoc(doc))
    : [castDoc(snapshot)]
}

export const getRealtimeData = (state, propName, queryRef, next) => {
  state.unsubscribers[propName] = queryRef.onSnapshot(async snapshot => {
    state[propName] = castSnapshot(state, snapshot)
    return next ? next(state) : null
  })
}

export const getInitialAndRealtimeData = async (state, propName, queryRef, next) => {
  state[propName] = castSnapshot(state, await queryRef.get())
  state.unsubscribers[propName] = queryRef.onSnapshot(async snapshot => {
    state[propName] = castSnapshot(state, snapshot)
    return next ? next(state) : null
  })
}

export const findItem = (list, id) => ({
  ...((list || []).find(item => item.id === id) || {})
})
