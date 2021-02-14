import { defaults } from '../conf'
import { findItem, accountPriv, isMemberOf } from '../store'
import {
  storeRequestedRoute
} from './localStrage'

export const routePermission = (priv, route) => {
  return Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )
}

export const compareRoutes = (r1, r2) => {
  const params1 = r1.params || {}
  const params2 = r2.params || {}
  return r1.name === r2.name &&
    !Object.keys(params1).some(
      key => !Object.keys(params2).includes(key)
    ) &&
    !Object.keys(params2).some(
      key => !Object.keys(params1).includes(key)
    ) &&
    !Object.keys(r1.params || {}).some(
      key => params1[key] !== params2[key]
    )
}

export const guardRoute = (router, route, state) => {
  const priv = accountPriv(state, state.me)
  if (state.loading || !route || !route.name || routePermission(priv, router.match(route))) {
    return true
  } else {
    const target = priv.user ? { name: 'top' } : { name: 'signin' }
    if (!compareRoutes(target, route)) {
      router.push(target).catch(() => {})
    }
    return false
  }
}

export const guardMenuItem = (menuItems, router, priv, goPage) => menuItems
  .filter(item => (
    (item.route && routePermission(priv, router.match(item.route))) ||
    (item.privs && item.privs.some(key => priv[key]))
  ))
  .map(item => ({
    ...item,
    action: item.route ? () => goPage(item.route) : item.action
  }))

export const detectPrivilegesChanged = (me, groups, groupsPrev) => {
  const hasPriv = (groups, groupId) => isMemberOf(me, findItem(groups, groupId))
  return groupsPrev && groupsPrev.length && (
    hasPriv(groupsPrev, 'managers') !== hasPriv(groups, 'managers') ||
    hasPriv(groupsPrev, 'admins') !== hasPriv(groups, 'admins') ||
    hasPriv(groupsPrev, 'testers') !== hasPriv(groups, 'testers')
  )
}

export const goPage = (state, router) => route => {
  if (guardRoute(router, route, state)) {
    if (!defaults.routeExcludeFromStorage.includes(route.name)) {
      storeRequestedRoute(route)
    }
    router.push(route).catch(() => {})
  }
}
