import { providers } from '../conf'
import { myPriv } from './accounts'
import { groupsOfMe } from './groups'
import { castDoc } from './io'

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
  state.categories = []
  state.invitations = {}
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
  const me = castDoc(await db.collection('accounts').doc(id).get())
  updateMe({ auth, state }, me)
}

export const initUserData = async ({ db, auth, state }) => {
  state.loading = true
  unsubscribeAll(state)
  state.authMessage = ''
  // window.localStorage.setItem('tamuroAuthMessage', '')
  await db.collection('accounts').doc(state.me.id).update({
    signedInAt: new Date()
  })

  await getInitialAndRealtimeData(
    state,
    'groups',
    db.collection('groups').orderBy('name', 'asc'),
    onGroupsChange(db)
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
  const priv = myPriv(state)
  if (priv.admin || priv.manager) {
    await getInitialAndRealtimeData(
      state,
      'accounts',
      db.collection('accounts'),
      state => {
        updateMe({ auth, state }, findItem(state.accounts, state.me.id))
        onAccountChange(db)(state)
      }
    )
  } else {
    const meRef = db.collection('accounts').doc(state.me.id)
    state.accounts = [castDoc(await meRef.get())]
    onAccountChange(db)(state)
    state.unsubscribers.accounts = meRef.onSnapshot(me => {
      state.accounts = [castDoc(me)]
      updateMe({ auth, state }, findItem(state.accounts, state.me.id))
      onAccountChange(db)(state)
    })
  }
  if (myPriv(state).manager) {
    await getInitialAndRealtimeData(
      state,
      'profiles',
      db.collection('profiles'))
  } else {
    const myProfileRef = db.collection('profiles').doc(state.me.id)
    state.profiles = [castDoc(await myProfileRef.get())]
    state.unsubscribers.profiles = myProfileRef.onSnapshot(prof => {
      state.profiles = [castDoc(prof)]
    })
  }
  state.loading = false
}

export const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
  const priv = myPriv(state)
  state[propName] = (await queryRef.get()).docs
    .filter(doc => priv.admin || priv.manager || !doc.data().deletedAt)
    .map(doc => castDoc(doc))
  state.unsubscribers[propName] = queryRef.onSnapshot(querySnapshot => {
    const priv = myPriv(state)
    state[propName] = querySnapshot.docs
      .filter(doc => priv.admin || priv.manager || !doc.data().deletedAt)
      .map(doc => castDoc(doc))
    return onChange && onChange(state)
  })
}

export const onGroupsChange = db => state => {
  var changed = false
  const groupChats = { ...state.groupChats }
  const groups = groupsOfMe(state)
  Object.keys(state.unsubscribers)
    .filter(key => key.slice(0, 5) === 'chat_' && !groups.includes(key.slice(5)))
    .forEach(key => {
      state.unsubscribers[key]()
      delete state.unsubscribers[key]
      delete groupChats[key.slice(5)]
      changed = true
    })
  groups
    .filter(group => !Object.keys(groupChats).includes(group.id))
    .forEach(group => {
      const id = group.id
      state.unsubscribers[`chat_${id}`] = db.collection('groups').doc(id)
        .collection('chat').orderBy('createdAt', 'asc')
        .onSnapshot(querySnapshot => {
          groupChats[id] = querySnapshot.docs.map(doc => castDoc(doc))
        })
      changed = true
    })
  if (changed) {
    state.groupChats = groupChats
  }
}

export const onAccountChange = db => state => {
  var changed = false
  const hotlines = { ...state.hotlines }
  Object.keys(state.unsubscribers)
    .filter(key => key.slice(0, 8) === 'hotline_' && !state.accounts.includes(key.slice(8)))
    .forEach(key => {
      state.unsubscribers[key]()
      delete state.unsubscribers[key]
      delete hotlines[key.slice(8)]
      changed = true
    })
  state.accounts
    .filter(account => !Object.keys(hotlines).includes(account.id))
    .forEach(account => {
      const { id } = account
      state.unsubscribers[`hotline_${id}`] = db.collection('accounts').doc(id)
        .collection('hotline').orderBy('createdAt', 'asc')
        .onSnapshot(querySnapshot => {
          hotlines[id] = querySnapshot.docs.map(doc => castDoc(doc))
        })
      changed = true
    })
  if (changed) {
    state.hotlines = hotlines
  }
}

export const findItem = (list, id) => ({
  ...((list || []).find(item => item.id === id) || {})
})
