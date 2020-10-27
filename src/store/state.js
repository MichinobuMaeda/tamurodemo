import { getById, simplifyDoc } from './db'

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

export const initServiceData = async ({ db, state }) => {
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

export const initUserData = async ({ db, state }) => {
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

export const detectPrivilegesChanged = async (store, groups, groupsPrev) => {
  const hasPriv = (groups, groupId, account) => {
    return isMemberOf(account, getById(groups, groupId))
  }
  const me = store.state.me
  if (groupsPrev && groupsPrev.length && (
    hasPriv(groupsPrev, 'admins', me) !== hasPriv(groups, 'admins', me) ||
    hasPriv(groupsPrev, 'managers', me) !== hasPriv(groups, 'managers', me) ||
    hasPriv(groupsPrev, 'testers', me) !== hasPriv(groups, 'testers', me)
  )) {
    await initUserData(store)
  }
}

export const accountIsValid = account => !!(account && account.id && !account.deletedAt && account.valid)
export const isMemberOf = (account, group) => ((group || {}).members || []).includes(account.id)
export const accountPriv = ({ service, groups }, account) => {
  const valid = accountIsValid(account)
  return {
    guest: !valid,
    invited: !!(valid &&
      account.invitedAs &&
      account.invitedAt &&
      account.invitedAt.getTime() >= (new Date().getTime() - service.conf.invitationExpirationTime)),
    user: valid,
    admin: valid && isMemberOf(account, getById(groups, 'admins')),
    manager: valid && isMemberOf(account, getById(groups, 'managers')),
    tester: valid && isMemberOf(account, getById(groups, 'testers'))
  }
}
export const myPriv = ({ service, groups, me }) => accountPriv({ service, groups }, me)

export const accountStatus = (state, id) => {
  const account = (state.accounts && state.accounts.find(account => account.id === id)) || null
  return (!account || account.deletedAt)
    ? 'Account deleted'
    : !account.valid
      ? 'Account locked'
      : account.invitedAs
        ? account.invitedAt
          ? account.signedInAt && account.invitedAt.getTime() < account.signedInAt.getTime()
            ? 'Invitation accepted'
            : account.invitedAt.getTime() < (new Date().getTime() - state.service.conf.invitationExpirationTime)
              ? 'Invitation timeout'
              : 'Invited'
          : account.signedInAt
            ? 'Account active'
            : 'Account inactive'
        : account.signedInAt
          ? 'Account active'
          : 'Account inactive'
}
