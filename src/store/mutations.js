export const setService = (state, doc) => {
  state.service[doc.id] = doc.data()
  state.service = { ...state.service }
}
export const setCurrentUser = (state) => { state.currentUser = { ...state.firebase.auth().currentUser } }
export const resetCurrentUser = (state) => { state.currentUser = null }
export const setMe = (state, me) => {
  state.me = me
  state.menuPosition = (me && me.data().menuPosition) || state.menuPosition
}
export const resetMe = state => { state.me = null }
export const setGroups = (state, querySnapshot) => { state.groups = querySnapshot.docs }
export const resetGroups = (state) => { state.groups = [] }
export const setUsers = (state, querySnapshot) => {
  if (state.users && state.users.length) {
    let users = [ ...state.users ]
    querySnapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        users.push(change.doc)
        state.profiles[change.doc.id] = null
      } else if (change.type === 'modified') {
        users = users.map(user => change.doc.id === user.id ? change.doc : user)
        state.profiles[change.doc.id] = null
      } else if (change.type === 'removed') {
        users = users.filter(user => change.doc.id !== user.id)
        delete state.profiles[change.doc.id]
      }
    })
    state.users = users
  } else {
    state.users = querySnapshot.docs
    state.profiles = {}
    state.users.forEach(user => { state.profiles[user.id] = null })
  }
}
export const resetUsers = (state) => {
  state.users = []
  state.profiles = {}
}
export const setAccounts = (state, querySnapshot) => { state.accounts = querySnapshot.docs }
export const resetAccounts = (state) => { state.accounts = [] }

export const startLoading = state => {
  state.loading = [ 'start' ]
}
export const setLoading = (state, key) => {
  state.loading = [ ...state.loading.filter(item => item !== key), key ]
}
export const resetLoading = (state, key) => {
  state.loading = [ ...state.loading.filter(item => item !== key) ]
}
export const clearLoading = state => {
  state.loading = []
}

export const addUnsubscriber = (state, unsubscriber) => { state.unsubscribers.push(unsubscriber) }
export const setMessage = (state, message) => {
  state.message = message.key ? message : { key: message, params: {} }
  window.localStorage.setItem('message', JSON.stringify(state.message))
}
export const resetMessage = (state) => {
  state.message = { key: 'noMessage', params: {} }
  window.localStorage.setItem('message', JSON.stringify(state.message))
}
export const resetUnsubscribers = state => { state.unsubscribers = [] }
