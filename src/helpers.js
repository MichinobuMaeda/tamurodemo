import { inject } from '@vue/composition-api'

export const StoreSymbol = Symbol('store')
export const useStore = () => inject(StoreSymbol)

// Local storage keys
const product = 'tamuro'
const LS_REQ_ROUTE = `${product}RequestedRoute`
const LS_REQ_EMAIL = `${product}tamuroEmailLinkRequest`

// UI
export { color } from '@/conf/colors'
export { icon } from '@/conf/icons'
export { locales } from '@/conf/locales'
export { menuPositions } from '@/conf/menuPositions'
export { timezones } from '@/conf/timezones'
export * from '@/conf/validators'

export const setProcForWait = async (state, proc, next = null) => {
  state.waitProc = true
  try {
    await proc()
    if (next) { await next() }
  } finally {
    state.waitProc = false
  }
}

// Route
export const topUrl = () => window.location.href
  .replace(/\?.*/, '')
  .replace(/#.*/, '#/')

export const signInUrl = () => window.location.href
  .replace(/\?.*/, '')
  .replace(/#.*/, '#/signin')

export const goPage = (router, route) => {
  if (!['signin', 'policy'].includes(route.name)) {
    storeRequestedRoute(route)
  }
  router.push(route).catch(() => {})
}

/**
 * { id, data() } => { id, ...data }
 * Firestore Timestamp => Date
 */
export const simplifyDoc = doc => ({
  id: doc.id,
  ...Object.keys(doc.data()).reduce(
    (ret, cur) => ({
      ...ret,
      [cur]: (doc.data()[cur] && doc.data()[cur].toDate ? doc.data()[cur].toDate() : doc.data()[cur])
    }), ({}))
})

export const getById = (list, id) => (list ||[]).reduce(
  (ret, cur) => cur.id === id ? { ...cur } : ret,
  {}
)

// Account and Privilege
export const userIsValid = (state, id) => {
  const user = getById(state.accounts, id)
  return !!(user && user.valid)
}

export const userIsMemberOf = (state, id, groupId) => !!(state.groups || []).some(
  group => group.id === groupId && group.members.includes(id)
)

export const iamValid = state => !!(state.me.id && state.me.valid)

export const iamMemberOf = (state, groupId) => userIsMemberOf(state, state.me.id, groupId)

export const getMyPriv = state => ({
  guest: !iamValid(state),
  user: iamValid(state),
  admin: iamValid(state) && iamMemberOf(state, 'admins'),
  manager: iamValid(state) && iamMemberOf(state, 'managers'),
  tester: iamValid(state) && iamMemberOf(state, 'testers')
})

export const getMyName = state => getById(state.users, state.me.id).name || 'Guest'

// Local storage
export const eraseRequestedEmail = () => {
  window.localStorage.setItem(LS_REQ_EMAIL, '')
}

export const storeRequestedEmail = email => {
  window.localStorage.setItem(LS_REQ_EMAIL, email)
}

export const restoreRequestedEmail = () => {
  return window.localStorage.getItem(LS_REQ_EMAIL)
}

export const eraseRequestedRoute = () => {
  window.localStorage.setItem(LS_REQ_ROUTE, '')
}

export const storeRequestedRoute = route => {
  const { name, param } = route
  window.localStorage.setItem(LS_REQ_ROUTE, JSON.stringify({ name, param }))
}

export const restoreRequestedRoute = defaultRoute => {
  const saved = window.localStorage.getItem(LS_REQ_ROUTE)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      return defaultRoute
    }
  } else {
    return null
  }
}
