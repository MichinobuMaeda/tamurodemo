import { appId } from '../conf'

export const LS_REQ_EMAIL = `${appId}EmailLinkRequest`

export const storeRequestedEmail = email => window.localStorage.setItem(LS_REQ_EMAIL, email)
export const restoreRequestedEmail = () => window.localStorage.getItem(LS_REQ_EMAIL)
export const eraseRequestedEmail = () => window.localStorage.setItem(LS_REQ_EMAIL, '')

export const LS_REQ_OAUTH_DATA = `${appId}EmailLinkRequest`

export const storeOAuthData = data => window.localStorage.setItem(LS_REQ_OAUTH_DATA, JSON.stringify(data))
export const restoreOAuthData = () => JSON.parse(window.localStorage.getItem(LS_REQ_OAUTH_DATA) || 'null')
export const eraseOAuthData = () => window.localStorage.setItem(LS_REQ_OAUTH_DATA, 'null')

export const LS_REQ_OAUTH_MESSAGE = `${appId}EmailLinkRequest`

export const storeOAuthMessage = message => window.localStorage.setItem(LS_REQ_OAUTH_MESSAGE, JSON.stringify(message))
export const restoreOAuthMessage = () => JSON.parse(window.localStorage.getItem(LS_REQ_OAUTH_MESSAGE) || 'null')
export const eraseOAuthMessage = () => window.localStorage.setItem(LS_REQ_OAUTH_MESSAGE, 'null')

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
