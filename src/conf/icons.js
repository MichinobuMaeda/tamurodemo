import { defaultIcons } from '@/components/defaults'

const iconList = {
  ...defaultIcons,
  'Top': 'home',
  'Sign in': 'account_circle',
  'Sign out': 'power_settings_new',
  'Privacy policy': 'privacy_tip',
  'Categories': 'label',
  'Category': 'label',
  'Groups': 'group',
  'Group': 'group',
  'Members': 'supervised_user_circle',
  'User': 'person',
  'Profile and Settings': 'contact_page',
  'Service': 'settings',
  'Upward': 'arrow_upward',
  'Downward': 'arrow_downward',
  'Top Left': 'north_west',
  'Top Right': 'north_east',
  'Bottom Left': 'south_west',
  'Bottom Right': 'south_east',
  'E-mail': 'mail',
  'Visible': 'visibility',
  'Invisible': 'visibility_off',
  'Send': 'send',
  'Defaults': 'settings_applications',
  'Update app': 'system_update_alt',
  'Update service': 'sync',
  'Service settings': 'settings'
}

export const icon = name => iconList[name] || 'description'
