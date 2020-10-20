import { myPriv } from '@/auth'
import { getById, simplifyDoc } from '@/utils'

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
  state.categories = []
  state.invitations = {}
  state.waitProc = null
  return state
}

export const initServiceData = async ({ db, state }, root) => {
  const onServiceUpdate = (querySnapshot) => {
    const service = {}
    querySnapshot.forEach(doc => {
      const { id, ...data } = simplifyDoc(doc)
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

export const initUserData = async ({ db, auth, state }, root) => {
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
  const priv = myPriv(state)
  if (priv.admin || priv.manager) {
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
  if (myPriv(state).manager) {
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
  }
  state.loading = false
}

const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
  const priv = myPriv(state)
  state[propName] = (await queryRef.get()).docs
    .filter(doc => priv.admin || priv.manager || !doc.data().deletedAt)
    .map(doc => simplifyDoc(doc))
  onChange && onChange(state)
  state.unsubscribers[propName] = queryRef.onSnapshot(querySnapshot => {
    const priv = myPriv(state)
    state[propName] = querySnapshot.docs
      .filter(doc => priv.admin || priv.manager || !doc.data().deletedAt)
      .map(doc => simplifyDoc(doc))
    onChange && onChange(state)
  })
}
