import Firebase from 'firebase'
import Moment from 'moment-timezone'

export const conf = state => state.conf
export const groups = state => state.groups.map(group => ({ id: group.id, ...group.data() }))
export const group = state => id => state.groups.reduce(
  (ret, cur) => cur.id === id ? { id, ...cur.data() } : ret,
  {}
)
export const users = state => state.users.map(user => ({ id: user.id, ...user.data() }))
export const user = state => id => state.users.reduce(
  (ret, cur) => cur.id === id ? { id, ...cur.data() } : ret,
  {}
)
export const accounts = state => state.accounts.map(account => ({ id: account.id, ...account.data() }))
export const account = state => id => state.accounts.reduce(
  (ret, cur) => cur.id === id ? { id, ...cur.data() } : ret,
  {}
)
export const accountStatus = state => id => {
  let account = state.accounts.reduce((ret, cur) => cur.id === id ? cur : ret, null)
  return (account && account.data().valid) ? (
    account.data().enteredAt ? 'far fa-check-circle' : (
      account.data().invitedAt ? 'far fa-paper-plane' : null
    )
  ) : 'fas fa-lock'
}
export const isValid = state => state.me && state.me.data().valid
export const isAdmin = state => state.me && state.me.data().valid && state.groups.reduce(
  (ret, cur) => (cur.id === 'admin') ? cur.data().members.filter(member => member === state.me.id).length : ret,
  false
)
export const isManager = state => state.me && state.me.data().valid && state.groups.reduce(
  (ret, cur) => (cur.id === 'manager') ? cur.data().members.filter(member => member === state.me.id).length : ret,
  false
)
export const isAdminOrManager = state => state.me && state.me.data().valid && state.groups.reduce(
  (ret, cur) => ['admin', 'manager'].includes(cur.id) ? cur.data().members.filter(member => member === state.me.id).length : ret,
  false
)
export const isSignInMethod = state => {
  return state.me && state.currentUser && (state.me.data().line_me || (state.currentUser.providerData && state.currentUser.providerData.length))
}
export const isFacebook = state => {
  return state.currentUser.providerData ? state.currentUser.providerData.reduce(
    (ret, cur) => cur.providerId === Firebase.auth.FacebookAuthProvider.PROVIDER_ID || ret,
    false
  ) : false
}
export const isGithub = state => {
  return state.currentUser.providerData ? state.currentUser.providerData.reduce(
    (ret, cur) => cur.providerId === Firebase.auth.GithubAuthProvider.PROVIDER_ID || ret,
    false
  ) : false
}
export const isGoogle = state => {
  return state.currentUser.providerData ? state.currentUser.providerData.reduce(
    (ret, cur) => cur.providerId === Firebase.auth.GoogleAuthProvider.PROVIDER_ID || ret,
    false
  ) : false
}
export const isTwitter = state => {
  return state.currentUser.providerData ? state.currentUser.providerData.reduce(
    (ret, cur) => cur.providerId === Firebase.auth.TwitterAuthProvider.PROVIDER_ID || ret,
    false
  ) : false
}
export const isLine = state => state.me && (!!state.me.data().line_me)
export const isEmail = state => !!state.firebase.auth().currentUser.email

const formatDateTime = (state, tm, format) => Moment(tm).tz(
  state.me.data().timezone || state.service.status.timezone
).format(format)
export const longTimestamp = state => tm => formatDateTime(state, tm, state.conf.locales.longTimestamp)
export const shortTimestamp = state => tm => formatDateTime(state, tm, state.conf.shortTimestamp)
export const shortDate = state => tm => formatDateTime(state, tm, state.conf.shortDate)
export const shortTime = state => tm => formatDateTime(state, tm, state.conf.shortTime)
