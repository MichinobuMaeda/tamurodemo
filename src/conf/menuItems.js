import { icon } from './icons'

export const menuItems = (myId, myName, priviligedItems, togglehPriviligedItems, showRawData) => {
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
      label: 'Administration',
      icon: icon('Administration'),
      color: 'menu-item-manager',
      route: { name: 'admin' }
    },
    {
      label: ['Priviliged items', { visible: (priviligedItems ? 'On' : 'Off') }],
      icon: icon(priviligedItems ? 'Visible' : 'Invisible'),
      color: 'menu-item-manager',
      privs: ['managerReal', 'adminReal', 'testerReal'],
      action: togglehPriviligedItems
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
