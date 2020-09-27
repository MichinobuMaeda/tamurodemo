import {
  eraseRequestedRoute,
  storeRequestedRoute,
  restoreRequestedRoute
} from '@/helpers'

const defaultRouteForUser = { name: 'top' }
const defaultRouteForGuest = { name: 'signin' }

const guard = (router, route, priv) => {
  const lastPage = restoreRequestedRoute(defaultRouteForUser)
  if (priv.user && lastPage) {
    eraseRequestedRoute()
    if (route.path !== lastPage.path) {
      router.push(lastPage).catch(() => {})
    }
  } else if (Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )) {
    // to do nothing
  } else {
    const target = priv.user ? defaultRouteForUser : defaultRouteForGuest
    if (route.path !== target.path) {
      if (priv.guest) {
        storeRequestedRoute(route)
      }
      router.push(target).catch(() => {})
    }
  }
}

export default guard
