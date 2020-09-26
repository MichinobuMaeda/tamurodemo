import { db } from '../plugins/firebase'
import * as service from './service'
import * as auth from './auth'
import * as ui from './ui'
import colors from '../conf/colors'
import * as utils from './utils'

export const clearUserData = state => {
  state.unsubscribers = state.unsubscribers || {}
  Object.keys(state.unsubscribers).forEach(key => {
    state.unsubscribers[key]()
  })
  auth.clearAuth(state)
  ui.clearUi(state)
  state.color = colors
}

export const clearState = state => {
  clearUserData(state)
  service.clearService(state)
  return state
}

const getInitialAndRealtimeData = async (state, propName, queryRef, onChange) => {
  state[propName] = (await queryRef.get()).docs.map(doc => utils.simplifyDoc(doc))
  onChange && onChange(state)
  state.unsubscribers[propName] = queryRef.onSnapshot(querySnapshot => {
    state[propName] = querySnapshot.docs.map(doc => utils.simplifyDoc(doc))
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
    const priv = auth.myPriv(state)
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
          state.me = utils.getById(state.accounts, state.me.id)
        }
      )
    } else {
      const meQueryRef = db.collection('accounts').doc(state.me.id)
      state.accounts = [utils.simplifyDoc(await meQueryRef.get())]
      state.unsubscribers.accounts = meQueryRef.onSnapshot(doc => {
        state.accounts = [utils.simplifyDoc(doc)]
        state.me = utils.simplifyDoc(doc)
      })
    }
  }
}
