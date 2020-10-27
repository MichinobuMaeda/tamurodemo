import { inject } from '@vue/composition-api'

export { evalRules } from '@/components/helpers'

// Local storage
const LS_PRODUCT = 'tamuro'
const LS_REQ_ROUTE = `${LS_PRODUCT}RequestedRoute`
const LS_REQ_EMAIL = `${LS_PRODUCT}tamuroEmailLinkRequest`

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

export const restoreRequestedRoute = router => {
  const saved = window.localStorage.getItem(LS_REQ_ROUTE)
  window.localStorage.setItem(LS_REQ_ROUTE, '')
  if (saved) {
    try {
      const route = JSON.parse(saved)
      if (route.name) {
        router.push(route).catch(() => {})
      }
    } catch (e) {
      console.error(e)
    }
  }
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

export const baseUrl = () => {
  const { protocol, hostname, port } = window.location
  return ((protocol.toLowerCase() === 'http:' && port === '80') || (protocol.toLowerCase() === 'https:' && port === '443'))
    ? `${protocol}//${hostname}${process.env.BASE_URL}`
    : `${protocol}//${hostname}:${port}${process.env.BASE_URL}`
}

export const accountStatus = (state, id) => {
  const account = (state.accounts && state.accounts.find(account => account.id === id)) || null
  return (!account || account.deletedAt)
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

export const StoreSymbol = Symbol('store')
export const useStore = () => inject(StoreSymbol)
