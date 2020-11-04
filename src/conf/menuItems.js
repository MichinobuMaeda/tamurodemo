import { icon } from './icons'

export const menuItems = (myId, myName, showRawData) => {
  return [
    {
      label: 'Top',
      icon: icon('Top'),
      route: { name: 'top' }
    },
    {
      label: 'Sign in',
      icon: icon('Sign in'),
      route: { name: 'signin' }
    },
    {
      label: 'Chat',
      icon: icon('Chat'),
      route: { name: 'chat' }
    },
    {
      label: 'Privacy policy',
      icon: icon('Privacy policy'),
      route: { name: 'policy' }
    },
    {
      label: ['Profile', { user: myName }],
      icon: icon('Profile'),
      route: { name: 'user', params: { id: myId || 'unknown', mode: 'edit' } }
    },
    {
      label: 'Preferences',
      icon: icon('Preferences'),
      route: { name: 'preferences' }
    },
    {
      label: 'Categories',
      icon: icon('Categories'),
      color: 'menu-item-manager',
      route: { name: 'categories' }
    },
    {
      label: 'Users',
      icon: icon('Users'),
      color: 'menu-item-manager',
      route: { name: 'users' }
    },
    {
      label: 'Guide',
      icon: icon('Guide'),
      color: 'menu-item-manager',
      route: { name: 'invitationForEdit' }
    },
    {
      label: 'Service settings',
      icon: icon('Service settings'),
      color: 'menu-item-manager',
      route: { name: 'service' }
    },
    {
      label: 'Raw data',
      icon: icon('Raw data'),
      color: 'secondary',
      privs: ['admin', 'tester'],
      action: showRawData
    }
  ]
}
