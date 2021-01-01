import { appId } from '../conf'

export const LS_REQ_EMAIL = `${appId}EmailLinkRequest`

export const storeRequestedEmail = email => window.localStorage.setItem(LS_REQ_EMAIL, email)
export const restoreRequestedEmail = () => window.localStorage.getItem(LS_REQ_EMAIL)
export const eraseRequestedEmail = () => window.localStorage.setItem(LS_REQ_EMAIL, '')

export const LS_REQ_ROUTE = `${appId}RequestedRoute`

export const storeRequestedRoute = route => {
  window.localStorage.setItem(LS_REQ_ROUTE, JSON.stringify(route))
}

export const restoreRequestedRoute = () => {
  const saved = window.localStorage.getItem(LS_REQ_ROUTE)
  window.localStorage.setItem(LS_REQ_ROUTE, '')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
  }
  return null
}
export const eraseRequestedRoute = () => {
  window.localStorage.setItem(LS_REQ_ROUTE, 'null')
}
