import { appId } from '../conf'
import {
  findItem, myPriv, accountIsValid, isMemberOf, initUserData
} from '../store'
import { signOut } from './init'

export const routePermission = (router, priv, route) => {
  return Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )
}

export const guardRoute = (router, route, state) => {
  const priv = myPriv(state)
  if (state.loading || !route || !route.name || routePermission(router, priv, route)) {
    // to do nothing
  } else {
    const compareRoutes = (r1, r2) => r1.name === r2.name &&
      !Object.keys(r1.params || {}).some(
        key => (r1.params || {})[key] !== (r2.params || {})[key]
      )
    const target = priv.user ? { name: 'top' } : { name: 'signin' }
    if (!compareRoutes(target, route)) {
      router.push(target).catch(() => {})
    }
  }
}

export const guardMenuItem = (menuItems, router, priv, goPage) => menuItems
  .filter(item => (
    (item.route && routePermission(router, priv, router.match(item.route))) ||
    (item.privs && item.privs.some(key => priv[key]))
  ))
  .map(item => ({
    ...item,
    action: item.route ? () => goPage(item.route) : item.action
  }))

export const detectPrivilegesChanged = async (store, groups, groupsPrev) => {
  const hasPriv = (groups, groupId, account) => {
    return isMemberOf(account, findItem(groups, groupId))
  }
  const me = store.state.me
  if (groupsPrev && groupsPrev.length && (
    hasPriv(groupsPrev, 'admins', me) !== hasPriv(groups, 'admins', me) ||
    hasPriv(groupsPrev, 'managers', me) !== hasPriv(groups, 'managers', me) ||
    hasPriv(groupsPrev, 'testers', me) !== hasPriv(groups, 'testers', me)
  )) {
    await initUserData(store)
  }
}

export const detectAccountChanged = async (store, router, me, mePrev) => {
  if ((!mePrev.id || accountIsValid(mePrev)) && !accountIsValid(me)) {
    await signOut(store)
  } else if (!accountIsValid(mePrev) && accountIsValid(me)) {
    await initUserData(store)
    restoreRequestedRoute(router)
  }
}

export const goPage = router => route => {
  if (![
    'invitation',
    'signin',
    'policy'
  ].includes(route.name)) {
    storeRequestedRoute(route)
  }
  router.push(route).catch(() => {})
}

// Local storage
const LS_REQ_ROUTE = `${appId}RequestedRoute`

const storeRequestedRoute = route => {
  window.localStorage.setItem(LS_REQ_ROUTE, JSON.stringify(route))
}

const restoreRequestedRoute = router => {
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
