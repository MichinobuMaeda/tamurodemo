import * as helpers from '@/helpers'

const routePermission = (router, priv, { name, params }) => {
  const route = router.match({ name, params })
  return Object.keys(priv).some(
    key => priv[key] && route.matched.some(
      record => record.meta.privs.includes(key)
    )
  )
}

const menuItems = (priv, myName, me, page, router) => () => {
  const { icon, goPage } = helpers
  return [
    {
      label: 'Top',
      icon: icon('Top'),
      visible: routePermission(router, priv, { name: 'top' }),
      action: () => { goPage(router, { name: 'top' }) }
    },
    {
      label: 'Sign in',
      icon: icon('Sign in'),
      visible: routePermission(router, priv, { name: 'signin' }),
      action: () => { goPage(router, { name: 'signin' }) }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      visible: routePermission(router, priv, { name: 'policy' }),
      action: () => { goPage(router, { name: 'policy' }) }
    },
    {
      label: ['Profile', { user: myName }],
      icon: icon('Profile'),
      visible: routePermission(router, priv, { name: 'user', params: { id: me.id || 'unknown', mode: 'edit' } }),
      action: () => { goPage(router, { name: 'user', params: { id: me.id || 'unknown', mode: 'edit' } }) }
    },
    {
      label: 'Preferences',
      icon: icon('Preferences'),
      visible: priv.user,
      action: () => { goPage(router, { name: 'preferences' }) }
    },
    {
      label: 'Categories',
      icon: icon('Categories'),
      color: 'menu-item-manager',
      visible: routePermission(router, priv, { name: 'categories' }),
      action: () => { goPage(router, { name: 'categories' }) }
    },
    {
      label: 'Users',
      icon: icon('Users'),
      color: 'menu-item-manager',
      visible: routePermission(router, priv, { name: 'users' }),
      action: () => { goPage(router, { name: 'users' }) }
    },
    {
      label: 'Guide',
      icon: icon('Guide'),
      color: 'menu-item-manager',
      visible: routePermission(router, priv, { name: 'invitationForEdit' }),
      action: () => { goPage(router, { name: 'invitationForEdit' }) }
    },
    {
      label: 'Service settings',
      icon: icon('Service settings'),
      color: 'menu-item-manager',
      visible: routePermission(router, priv, { name: 'service' }),
      action: () => { goPage(router, { name: 'service' }) }
    },
    {
      label: 'Raw data',
      icon: icon('Raw data'),
      color: 'secondary',
      visible: priv.admin || priv.tester,
      action: () => { page.rawData = true }
    }
  ].filter(item => item.visible)
}

export default menuItems
