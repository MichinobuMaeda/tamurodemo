import { signOut } from './actionsAuth'

export const onSignIn = async ({ commit, state, getters }, { user, i18n }) => {
  commit('setLoading', 'me')
  let me = await state.db.collection('accounts').doc(user.uid).get()
  if (me && me.exists && me.data().valid) {
    commit('resetMessage')
    commit('setMe', me)
    i18n.locale = state.me.locale || state.preferences.locale || i18n.locale
    let admin = await state.db.collection('groups').doc('admin').get()
    let manager = await state.db.collection('groups').doc('manager').get()
    if (admin.data().members.includes(me.id) || manager.data().members.includes(me.id)) {
      commit('setUnsub', {
        key: 'top',
        unsub: state.db.collection('accounts').onSnapshot(querySnapshot => {
          commit('setAccounts', querySnapshot)
        })
      })
    }
    commit('setUnsub', {
      key: 'top',
      unsub: state.db.collection('groups').orderBy('name', 'asc').onSnapshot(querySnapshot => {
        commit('setGroups', querySnapshot)
      })
    })
    commit('setUnsub', {
      key: 'top',
      unsub: state.db.collection('users').orderBy('name', 'asc').onSnapshot(querySnapshot => {
        commit('setUsers', querySnapshot)
      })
    })
    if ((!getters.me.enteredAt) && getters.isSignInMethod) {
      let ts = new Date()
      await state.db.collection('accounts').doc(user.uid).update({
        enteredAt: ts,
        updatedAt: ts
      })
    }
    commit('setUnsub', {
      key: 'top',
      unsub: state.db.collection('accounts').doc(me.id).onSnapshot(async me => {
        if (me && me.exists && me.data().valid) {
          commit('setMe', me)
          i18n.locale = state.me.locale || state.preferences.locale || i18n.locale
        } else if (state.me) {
          await signOut({ state })
        }
      })
    })
  } else {
    await signOut({ state })
  }
  commit('resetLoading', 'me')
}

export const onSignOut = async ({ commit, state }, { i18n }) => {
  Object.keys(state.unsub).forEach(key => {
    state.unsub[key].forEach(unsub => {
      unsub()
    })
  })
  commit('resetUnsubs')
  commit('resetAccounts')
  commit('resetUsers')
  commit('resetGroups')
  commit('resetMe')
  commit('resetMessage')
  i18n.locale = state.preferences.locale || state.service.status.locale || i18n.locale
}
