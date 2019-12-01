import { signOut } from './actionsAuth'

export const onSignIn = async ({ commit, state, getters }, { user, i18n }) => {
  commit('setLoading', 'me')
  let me = await state.db.collection('accounts').doc(user.uid).get()
  if (me && me.exists && me.data().valid) {
    commit('resetMessage')
    commit('setMe', me)
    i18n.locale = state.me.data().locale || state.service.status.locale || i18n.locale
    let admin = await state.db.collection('groups').doc('admin').get()
    let manager = await state.db.collection('groups').doc('manager').get()
    if (admin.data().members.includes(me.id) || manager.data().members.includes(me.id)) {
      commit('addUnsubscriber', state.db.collection('accounts').onSnapshot(querySnapshot => {
        commit('setAccounts', querySnapshot)
      }))
    }
    commit('addUnsubscriber', state.db.collection('groups').orderBy('name', 'asc').onSnapshot(querySnapshot => {
      commit('setGroups', querySnapshot)
    }))
    commit('addUnsubscriber', state.db.collection('users').orderBy('name', 'asc').onSnapshot(querySnapshot => {
      commit('setUsers', querySnapshot)
    }))
    if ((!me.data().enteredAt) && getters.isSignInMethod) {
      let ts = new Date()
      await state.db.collection('accounts').doc(user.uid).update({
        enteredAt: ts,
        updatedAt: ts
      })
    }
    commit('addUnsubscriber', state.db.collection('accounts').doc(me.id).onSnapshot(async doc => {
      commit('setMe', doc.exists ? doc : null)
      i18n.locale = state.me.data().locale || state.service.status.locale || i18n.locale
      if (!(state.me && state.me.exists && state.me.data().valid)) {
        await signOut({ state })
      }
    }))
  } else {
    await signOut({ state })
  }
  commit('resetLoading', 'me')
}

export const onSignOut = async ({ commit, state }, { i18n }) => {
  state.unsubscribers.forEach(unsubscriber => {
    unsubscriber()
  })
  commit('resetUnsubscribers')
  commit('resetAccounts')
  commit('resetUsers')
  commit('resetGroups')
  commit('resetMe')
  commit('resetMessage')
  i18n.locale = state.service.status.locale || i18n.locale
}
