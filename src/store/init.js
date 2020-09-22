import { db } from '../plugins/firebase'
import * as service from './service'
import * as auth from './auth'
import * as ui from './ui'
import colors from './colors'
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

export const initUserData = async state => {
  const priv = auth.myPriv(state)
  if (!priv.valid) {
    clearUserData(state)
  } else {
    state.groups = (
      await db.collection('groups')
        .orderBy('name', 'asc')
        .get()
    ).docs.map(doc => utils.simplifyDoc(doc))
    state.users = (
      await db.collection('users')
        .orderBy('name', 'asc')
        .get()
    ).docs.map(doc => utils.simplifyDoc(doc))
    if (priv.admin) {
      state.accounts = (
        await db.collection('accounts')
          .get()
      ).docs.map(doc => utils.simplifyDoc(doc))
    } else {
      state.accounts = [
        utils.simplifyDoc(
          await db.collection('accounts')
            .doc(state.me.id)
            .get()
        )
      ]
    }
  }
}
