import { goPage } from "./ui";
import { myPriv } from "./auth";

const routePermission = (router, currentPriv, name) => {
  const route = router.match({ name })
  return Object.keys(currentPriv).some(
    priv => currentPriv[priv] && route.matched.some(
      record => record.meta.privs.includes(priv)
    )
  )
}

const menuItems = (state, router) => {
  const currentPriv = myPriv(state)
  return [
    {
      label: 'Top',
      icon: 'home',
      visible: routePermission(router, currentPriv, 'top'),
      action: () => { goPage(state, router, 'top') }
    },
    {
      label: 'Sign in',
      icon: 'account_circle',
      visible: routePermission(router, currentPriv, 'signin'),
      action: () => { goPage(state, router, 'signin') }
    },
    {
      label: 'Privacy policy',
      icon: 'privacy_tip',
      visible: routePermission(router, currentPriv, 'policy'),
      action: () => { goPage(state, router, 'policy') }
    },
    {
      label: 'Raw Data',
      icon: 'memory',
      visible: routePermission(router, currentPriv, 'raw'),
      action: () => { goPage(state, router, 'raw') }
    }
  ]
}

export default menuItems
