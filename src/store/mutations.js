export const setService = (state, doc) => { state.service[doc.id] = doc.data() }
export const setMe = (state, me) => { state.me = me }
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
export const setLoading = state => { state.loading = true }
export const resetLoading = state => { state.loading = false }
