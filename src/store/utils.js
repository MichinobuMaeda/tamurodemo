import { appId } from '@/conf'

export { evalRules } from '@/components/helpers'

// Local storage
const LS_REQ_ROUTE = `${appId}RequestedRoute`

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
