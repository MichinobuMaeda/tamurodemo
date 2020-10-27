import { icon } from './icons'

export const menuItems = (myId, myName, priv, routePermission, goPage, showRawData) => () => {
  return [
    {
      label: 'Top',
      icon: icon('Top'),
      visible: routePermission({ name: 'top' }),
      action: () => { goPage({ name: 'top' }) }
    },
    {
      label: 'Sign in',
      icon: icon('Sign in'),
      visible: routePermission({ name: 'signin' }),
      action: () => { goPage({ name: 'signin' }) }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      visible: routePermission({ name: 'policy' }),
      action: () => { goPage({ name: 'policy' }) }
    },
    {
      label: ['Profile', { user: myName }],
      icon: icon('Profile'),
      visible: routePermission({ name: 'user', params: { id: myId || 'unknown', mode: 'edit' } }),
      action: () => { goPage({ name: 'user', params: { id: myId || 'unknown', mode: 'edit' } }) }
    },
    {
      label: 'Preferences',
      icon: icon('Preferences'),
      visible: priv.user,
      action: () => { goPage({ name: 'preferences' }) }
    },
    {
      label: 'Categories',
      icon: icon('Categories'),
      color: 'menu-item-manager',
      visible: routePermission({ name: 'categories' }),
      action: () => { goPage({ name: 'categories' }) }
    },
    {
      label: 'Users',
      icon: icon('Users'),
      color: 'menu-item-manager',
      visible: routePermission({ name: 'users' }),
      action: () => { goPage({ name: 'users' }) }
    },
    {
      label: 'Guide',
      icon: icon('Guide'),
      color: 'menu-item-manager',
      visible: routePermission({ name: 'invitationForEdit' }),
      action: () => { goPage({ name: 'invitationForEdit' }) }
    },
    {
      label: 'Service settings',
      icon: icon('Service settings'),
      color: 'menu-item-manager',
      visible: routePermission({ name: 'service' }),
      action: () => { goPage({ name: 'service' }) }
    },
    {
      label: 'Raw data',
      icon: icon('Raw data'),
      color: 'secondary',
      visible: priv.admin || priv.tester,
      action: showRawData
    }
  ].filter(item => item.visible)
}
