import { myPriv } from './auth';
import { goPage } from './utils'
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
      action: () => { goPage(router,{ name: 'top' }) }
    },
    {
      label: 'Sign in',
      icon: icon('Sign in'),
      visible: routePermission(router, currentPriv, 'signin'),
      action: () => { goPage(router,{ name: 'signin' }) }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      visible: routePermission(router, currentPriv, 'policy'),
      action: () => { goPage(router,{ name: 'policy' }) }
    },
    {
      label: 'Raw Data',
      icon: icon('Raw Data'),
      visible: routePermission(router, currentPriv, 'raw'),
      action: () => { goPage(router,{ name: 'raw' }) }
    }
  ].filter(item => item.visible)
}

export default menuItems
