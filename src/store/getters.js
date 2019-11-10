import Firebase from 'firebase'

export const conf = state => state.conf
export const isValidAccount = state => state.me && state.me.data().valid
export const isAdmin = state => state.me && state.me.data().valid && state.groups.reduce((ret, cur) => (cur.id === 'admin') ? cur.data().members.filter(member => member === state.me.id).length : ret, false)
export const isManager = state => state.me && state.me.data().valid && state.groups.reduce((ret, cur) => (cur.id === 'manager') ? cur.data().members.filter(member => member === state.me.id).length : ret, false)
export const isSignInMethod = state => {
  let me = state.me
  let user = state.firebase.auth().currentUser
  return me && user && (me.data().lineUid || (user.providerData && user.providerData.length))
}
export const isFacebook = state => {
  let user = state.firebase.auth().currentUser
  return user.providerData ? user.providerData.reduce((ret, cur) => cur.providerId === Firebase.auth.FacebookAuthProvider.PROVIDER_ID || ret, false) : false
}
export const isGithub = state => {
  let user = state.firebase.auth().currentUser
  return user.providerData ? user.providerData.reduce((ret, cur) => cur.providerId === Firebase.auth.GithubAuthProvider.PROVIDER_ID || ret, false) : false
}
export const isGoogle = state => {
  let user = state.firebase.auth().currentUser
  return user.providerData ? user.providerData.reduce((ret, cur) => cur.providerId === Firebase.auth.GoogleAuthProvider.PROVIDER_ID || ret, false) : false
}
export const isTwitter = state => {
  let user = state.firebase.auth().currentUser
  return user.providerData ? user.providerData.reduce((ret, cur) => cur.providerId === Firebase.auth.TwitterAuthProvider.PROVIDER_ID || ret, false) : false
}
export const isLine = state => !!state.me.data().lineUid
export const isEmail = state => !!state.firebase.auth().currentUser.email
