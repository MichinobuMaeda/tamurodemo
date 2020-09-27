import * as helpers from '@/helpers'

const routePermission = (router, priv, name) => {
  const route = router.match({ name })
  return Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )
}

const menuItems = (priv, myName, page, router) => () => {
  const { icon, goPage } = helpers
  return [
    {
      label: 'Top',
      icon: icon('Top'),
      visible: routePermission(router, priv, 'top'),
      action: () => { goPage(router,{ name: 'top' }) }
    },
    {
      label: 'Sign in',
      icon: icon('Sign in'),
      visible: routePermission(router, priv, 'signin'),
      action: () => { goPage(router,{ name: 'signin' }) }
    },
    {
      label: ['Profile and Settings', { user: myName }],
      icon: icon('Profile and Settings'),
      visible: routePermission(router, priv, 'me'),
      action: () => { goPage(router,{ name: 'me' }) }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      visible: routePermission(router, priv, 'policy'),
      action: () => { goPage(router,{ name: 'policy' }) }
    },
    {
      label: 'Service settings',
      icon: icon('Service settings'),
      visible: routePermission(router, priv, 'service'),
      action: () => { goPage(router,{ name: 'service' }) }
    },
    {
      label: 'Raw data',
      icon: icon('Raw data'),
      visible: priv.admin || priv.tester,
      action: () => { page.rawData = true }
    }
  ].filter(item => item.visible)
}

export default menuItems
