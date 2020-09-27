import { db } from '../plugins/firebase'
import { clearService } from './service'
import { clearAuth, myPriv } from './auth'
import { clearUsers } from './users'
import { clearUi } from './ui'
import { simplifyDoc, getById } from './utils'
import colors from '../conf/colors'

export const clearUserData = state => {
  state.unsubscribers = state.unsubscribers || {}
  Object.keys(state.unsubscribers).forEach(key => {
    state.unsubscribers[key]()
  })
  clearAuth(state)
  clearUsers(state)
  clearUi(state)
  state.color = colors
}

export const clearState = state => {
  clearUserData(state)
  clearService(state)
  return state
}

const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
  state[propName] = (await queryRef.get()).docs.map(doc => simplifyDoc(doc))
  onChange && onChange(state)
  state.unsubscribers[propName] = queryRef.onSnapshot(querySnapshot => {
    state[propName] = querySnapshot.docs.map(doc => simplifyDoc(doc))
    onChange && onChange(state)
  })
}

export const initUserData = async state => {
  if (!state.me || !state.me.valid) {
    clearUserData(state)
  } else {
    await getInitialAndRealtimeData(
      state,
      'groups',
      db.collection('groups').orderBy('name', 'asc')
    )
    const priv = myPriv(state)
    await getInitialAndRealtimeData(
      state,
      'users',
      db.collection('users').orderBy('name', 'asc')
    )
    if (priv.admin) {
      await getInitialAndRealtimeData(
        state,
        'accounts',
        db.collection('accounts'),
        (state) => {
          state.me = getById(state.accounts, state.me.id)
        }
      )
    } else {
      const meQueryRef = db.collection('accounts').doc(state.me.id)
      state.accounts = [simplifyDoc(await meQueryRef.get())]
      state.unsubscribers.accounts = meQueryRef.onSnapshot(doc => {
        state.accounts = [simplifyDoc(doc)]
        state.me = simplifyDoc(doc)
      })
    }
  }
}
