import { inject } from '@vue/composition-api'

export const StoreSymbol = Symbol('store')
export const useStore = () => inject(StoreSymbol)

// Local storage keys
const LS_PRODUCT = 'tamuro'
const LS_REQ_ROUTE = `${LS_PRODUCT}RequestedRoute`
const LS_REQ_EMAIL = `${LS_PRODUCT}tamuroEmailLinkRequest`

// UI
export * from '@/components/helpers'
export { icon } from '@/conf/icons'
export * from '@/conf/validators'

// Route
export const topUrl = () => window.location.href
  .replace(/\?.*/, '')
  .replace(/#.*/, '#/')

export const signInUrl = () => window.location.href
  .replace(/\?.*/, '')
  .replace(/#.*/, '#/signin')

export const goPage = (router, route) => {
  if (![
    'invitation',
    'signin',
    'policy',
    'preferences'
  ].includes(route.name)) {
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

export const getById = (list, id) => (list || []).reduce(
  (ret, cur) => cur.id === id ? { ...cur } : ret,
  {}
)

// Account and Privilege

export const accountIsValid = account => !!(account && account.id && !account.deletedAt && account.valid)
export const accountIsMemberOf = (account, group) => ((group || {}).members || []).includes(account.id)

export const accountPriv = (service, groups, account) => {
  const valid = accountIsValid(account)
  return {
    guest: !valid,
    invited: !!(valid &&
      account.invitedAs &&
      account.invitedAt &&
      account.invitedAt.getTime() >= (new Date().getTime() - service.conf.invitationExpirationTime)),
    user: valid,
    admin: valid && accountIsMemberOf(account, getById(groups, 'admins')),
    manager: valid && accountIsMemberOf(account, getById(groups, 'managers')),
    tester: valid && accountIsMemberOf(account, getById(groups, 'testers'))
  }
}

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

export const storeRequestedRoute = route => {
  window.localStorage.setItem(LS_REQ_ROUTE, JSON.stringify(route))
}

export const restoreRequestedRoute = () => {
  const saved = window.localStorage.getItem(LS_REQ_ROUTE)
  if (saved) {
    try {
      const route = JSON.parse(saved)
      return route.name ? route : null
    } catch (e) {
      return null
    }
  } else {
    return null
  }
}

export const accountStatus = (state, id) => {
  const account = getById(state.accounts, id)
  return account.deletedAt
    ? 'Account deleted'
    : !account.valid
      ? 'Account locked'
      : account.invitedAs
        ? account.invitedAt
          ? account.signedInAt && account.invitedAt.getTime() < account.signedInAt.getTime()
            ? 'Invitation accepted'
            : account.invitedAt.getTime() < (new Date().getTime() - state.service.conf.invitationExpirationTime)
              ? 'Invitation timeout'
              : 'Invited'
          : account.signedInAt
            ? 'Account active'
            : 'Account inactive'
        : account.signedInAt
          ? 'Account active'
          : 'Account inactive'
}
