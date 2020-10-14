const defaultRouteForUser = { name: 'top' }
const defaultRouteForGuest = { name: 'signin' }

const routePermission = (router, priv, route) => {
  return Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )
}

const compareRoutes = (r1, r2) => r1.name === r2.name &&
  !Object.keys(r1.params || {}).some(
    key => (r1.params || {})[key] !== (r2.params || {})[key]
  )

const guard = (router, route, priv, loading) => {
  if (loading || !route || !route.name || routePermission(router, priv, route)) {
    // to do nothing
  } else {
    const target = priv.user ? defaultRouteForUser : defaultRouteForGuest
    if (!compareRoutes(target, route)) {
      router.push(target).catch(() => {})
    }
  }
}

export default guard
