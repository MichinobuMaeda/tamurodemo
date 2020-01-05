const simplify = item => ({ id: item.id, ...item.data() })
const saveMessage = (state, message) => {
  state.message = message.key ? message : { key: message, params: {} }
  window.localStorage.setItem('message', message)
}
export const setMessage = (state, message) => saveMessage(state, message)
export const resetMessage = state => saveMessage(state, '')
export const setUnsub = (state, { unsub, key }) => { state.unsub[key] = [ ...(state.unsub[key] || []), unsub ] }
export const resetUnsubs = state => { state.unsub = {} }
export const startLoading = state => { state.loading = [ 'start' ] }
export const setLoading = (state, key) => { state.loading = [ ...state.loading.filter(item => item !== key), key ] }
export const resetLoading = (state, key) => { state.loading = [ ...state.loading.filter(item => item !== key) ] }
export const clearLoading = state => { state.loading = [] }
export const setService = (state, doc) => { state.service = { ...state.service, [doc.id]: doc.data() } }
export const setMe = (state, me) => { state.me = (me && me.exists && me.data().valid) ? simplify(me) : null }
export const resetMe = state => { state.me = null }
export const setGroups = (state, querySnapshot) => { state.groups = querySnapshot.docs.map(item => simplify(item)) }
export const resetGroups = state => { state.groups = [] }
export const setAccounts = (state, querySnapshot) => { state.accounts = querySnapshot.docs.map(item => simplify(item)) }
export const resetAccounts = state => { state.accounts = [] }
export const setUsers = (state, querySnapshot) => {
  let users = [ ...(state.users || []) ]
  querySnapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      users.push(simplify(change.doc))
      state.profiles[change.doc.id] = {}
    } else if (change.type === 'modified') {
      users = users.map(user => change.doc.id === user.id ? simplify(change.doc) : user)
      state.profiles[change.doc.id] = {}
    } else if (change.type === 'removed') {
      users = users.filter(user => change.doc.id !== user.id)
      delete state.profiles[change.doc.id]
    }
  })
  state.users = users
}
export const resetUsers = state => {
  state.users = []
  state.profiles = {}
}
export const toggleLimitedPriv = state => { state.limitedPriv = !state.limitedPriv }
