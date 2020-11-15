import { myPriv } from './accounts'
import { groupsOfMe } from './groups'

export const clearServiceData = (state = {}) => {
  state.service = {}
  return state
}

const unsubscribeAll = state => {
  if (state.unsubscribers) {
    Object.keys(state.unsubscribers).forEach(key => {
      state.unsubscribers[key]()
    })
  }
}

export const clearUserData = state => {
  unsubscribeAll(state)
  state.unsubscribers = {}
  state.me = {}
  state.accounts = []
  state.users = []
  state.profiles = []
  state.groups = []
  state.chats = {}
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
  db.collection('service').onSnapshot(
    querySnapshot => onServiceUpdate(querySnapshot)
  )
}

export const updateMe = ({ auth, state }, me = null) => {
  state.me = {
    ...me || state.me,
    ...((auth.currentUser && auth.currentUser.providerData) || [])
      .reduce(
        (ret, cur) => cur.providerId ? { ...ret, [cur.providerId.replace(/\./g, '_')]: true } : ret,
        {
          google_com: false,
          apple_com: false,
          facebook_com: false,
          github_com: false,
          microsoft_com: false,
          twitter_com: false
        }
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
      (state) => {
        updateMe({ auth, state }, findItem(state.accounts, state.me.id))
      }
    )
  } else {
    const meRef = db.collection('accounts').doc(state.me.id)
    state.accounts = [castDoc(await meRef.get())]
    state.unsubscribers.accounts = meRef.onSnapshot(me => {
      state.accounts = [castDoc(me)]
      state.me = castDoc(me)
    })
  }
  if (myPriv(state).manager) {
    await getInitialAndRealtimeData(
      state,
      'profiles',
      db.collection('profiles'))
  } else {
    const meRef = db.collection('profiles').doc(state.me.id)
    state.profiles = [castDoc(await meRef.get())]
    state.unsubscribers.profiles = meRef.onSnapshot(me => {
      state.profiles = [castDoc(me)]
    })
  }
  state.loading = false
}

const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
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

const onGroupsChange = db => async state => {
  groupsOfMe(state).forEach(group => {
    const id = group.id
    state.unsubscribers[`chat_${id}`] && state.unsubscribers[`chat_${id}`]()
    state.unsubscribers[`chat_${id}`] = db.collection('groups').doc(id)
      .collection('messages').orderBy('createdAt', 'asc')
      .onSnapshot(querySnapshot => {
        state.chats[id] = querySnapshot.docs.map(doc => castDoc(doc))
      })
  })
}

export const findItem = (list, id) => ({
  ...((list || []).find(item => item.id === id) || {})
})

/**
 * { id, data() } => { id, ...data }
 * Firestore Timestamp => Date
 */
export const castDoc = doc => ({
  id: doc.id,
  ...firestoreTimestampToDate(doc.data())
})

const firestoreTimestampToDate = val => {
  return val && val.toDate
    ? val.toDate()
    : (Array.isArray(val)
      ? val.map(item => firestoreTimestampToDate(item))
      : ((val && typeof val === 'object')
        ? Object.keys(val).reduce(
          (ret, cur) => ({
            ...ret,
            [cur]: firestoreTimestampToDate(val[cur])
          }), ({}))
        : val
      )
    )
}
