import Firebase from 'firebase/app'
import 'firebase/auth'
import Moment from 'moment-timezone'

export const conf = state => state.conf
export const menuPosition = state => (state.me && state.me.menuPosition) || state.preferences.menuPosition
export const locale = state => (state.me && state.me.locale) || state.preferences.locale
export const timezone = state => (state.me && state.me.timezone) || state.preferences.timezone
export const me = state => ({ ...state.me })
export const groups = state => state.groups.map(item => ({ ...item }))
export const group = state => id => state.groups.reduce((ret, cur) => cur.id === id ? { ...cur } : ret, {})
export const users = state => state.users.map(item => ({ ...item }))
export const currentUser = state => state.firebase.auth().currentUser
export const user = state => id => state.users.reduce((ret, cur) => cur.id === id ? { ...cur } : ret, {})
export const accounts = state => state.accounts.map(item => ({ ...item }))
export const account = state => id => state.accounts.reduce((ret, cur) => cur.id === id ? { ...cur } : ret, {})
export const accountStatus = state => id => {
  let { valid, enteredAt, invitedAt } = account(state)(id) || {}
  return (valid && enteredAt) ? 'accepted' : ((valid && invitedAt) ? 'invited' : 'blocked')
}
export const isValid = state => state.me && state.me.valid
export const isAdmin = state => isValid(state) && (group(state)('admin').members || []).some(member => member === state.me.id)
export const isManager = state => isValid(state) && (group(state)('manager').members || []).some(member => member === state.me.id)
export const isAdminOrManager = state => isAdmin(state) || isManager(state)
export const isSignInMethod = state => state.me && currentUser(state) && (state.me.line_me || (currentUser(state).providerData || []).length)
const isProvider = (state, providerId) => ((currentUser(state) && currentUser(state).providerData) || []).some(item => item.providerId === providerId)
export const isFacebook = state => isProvider(state, Firebase.auth.FacebookAuthProvider.PROVIDER_ID)
export const isGithub = state => isProvider(state, Firebase.auth.GithubAuthProvider.PROVIDER_ID)
export const isGoogle = state => isProvider(state, Firebase.auth.GoogleAuthProvider.PROVIDER_ID)
export const isTwitter = state => isProvider(state, Firebase.auth.TwitterAuthProvider.PROVIDER_ID)
export const isLine = state => state.me && (!!state.me.line_me)
export const isEmail = state => currentUser(state) && currentUser(state).email
const formatDateTime = (state, tm, format) => tm ? Moment(tm).tz(timezone(state)).format(format) : null
export const longTimestamp = state => tm => formatDateTime(state, tm, state.conf.locales.longTimestamp)
export const shortTimestamp = state => tm => formatDateTime(state, tm, state.conf.shortTimestamp)
export const shortDate = state => tm => formatDateTime(state, tm, state.conf.shortDate)
export const shortTime = state => tm => formatDateTime(state, tm, state.conf.shortTime)
export const oauthProviders = state => [
  {
    id: conf(state).auth.line,
    active: isLine(state),
    color: 'green',
    name: 'LINE',
    icon: 'fab fa-line'
  },
  {
    id: conf(state).auth.facebook,
    active: isFacebook(state),
    color: 'blue-10',
    name: 'Facebook',
    icon: 'fab fa-facebook'
  },
  {
    id: conf(state).auth.github,
    active: isGithub(state),
    color: 'black',
    name: 'Github',
    icon: 'fab fa-github'
  },
  {
    id: conf(state).auth.google,
    active: isGoogle(state),
    color: 'red-10',
    name: 'Google',
    icon: 'fab fa-google'
  },
  {
    id: conf(state).auth.twitter,
    active: isTwitter(state),
    color: 'light-blue',
    name: 'Twitter',
    icon: 'fab fa-twitter'
  }
]
