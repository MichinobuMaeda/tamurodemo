import { myPriv } from './auth';
import { goPage } from './utils'
import { myName, isAdmin, isTester } from './auth'
import icon from '../conf/icons'

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
      label: ['Profile and Settings', { user: myName(state) }],
      icon: icon('Profile and Settings'),
      visible: routePermission(router, currentPriv, 'me'),
      action: () => { goPage(router,{ name: 'me' }) }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      visible: routePermission(router, currentPriv, 'policy'),
      action: () => { goPage(router,{ name: 'policy' }) }
    },
    {
      label: 'Service settings',
      icon: icon('Service settings'),
      visible: routePermission(router, currentPriv, 'service'),
      action: () => { goPage(router,{ name: 'service' }) }
    },
    {
      label: 'Raw data',
      icon: icon('Raw data'),
      visible: isAdmin(state) || isTester(state),
      action: () => { state.rawData = true }
    }
  ].filter(item => item.visible)
}

export default menuItems
