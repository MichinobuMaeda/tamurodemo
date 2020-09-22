import { myPriv } from './auth';
import icon from './icons'

const routePermission = (router, currentPriv, name) => {
  const route = router.match({ name })
  return Object.keys(currentPriv).some(
    priv => currentPriv[priv] && route.matched.some(
      record => record.meta.privs.includes(priv)
    )
  )
}

const menuItems = (state, router) => () => {
  const currentPriv = myPriv(state)
  return [
    {
      label: 'Top',
      icon: icon('Top'),
      visible: routePermission(router, currentPriv, 'top'),
      action: () => { router.push({ name: 'top' }).catch(() => {}) }
    },
    {
      label: 'Sign in',
      icon: icon('Sign in'),
      visible: routePermission(router, currentPriv, 'signin'),
      action: () => { router.push({ name: 'signin' }).catch(() => {}) }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      visible: routePermission(router, currentPriv, 'policy'),
      action: () => { router.push({ name: 'policy' }).catch(() => {}) }
    },
    {
      label: 'Raw Data',
      icon: icon('Raw Data'),
      visible: routePermission(router, currentPriv, 'raw'),
      action: () => { router.push({ name: 'raw' }).catch(() => {}) }
    }
  ].filter(item => item.visible)
}

export default menuItems
