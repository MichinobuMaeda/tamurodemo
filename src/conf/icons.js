import { defaultIcons } from '@/components/defaults'

const iconList = {
  ...defaultIcons,
  Top: 'home',
  'Sign in': 'login',
  'Sign out': 'power_settings_new',
  Password: 'vpn_key',
  'Privacy policy': 'privacy_tip',
  Categories: 'label',
  Category: 'label',
  Groups: 'group',
  Group: 'group',
  Members: 'supervised_user_circle',
  Users: 'person',
  User: 'person',
  Profile: 'contact_page',
  'For all': 'sentiment_satisfied_alt',
  'For permitted': 'supervised_user_circle',
  'For managers': 'lock',
  Service: 'settings',
  Upward: 'arrow_upward',
  Downward: 'arrow_downward',
  'Top Left': 'north_west',
  'Top Right': 'north_east',
  'Bottom Left': 'south_west',
  'Bottom Right': 'south_east',
  'E-mail': 'mail',
  Visible: 'visibility',
  Invisible: 'visibility_off',
  Confirm: 'notifications',
  Send: 'send',
  Defaults: 'settings_applications',
  Preferences: 'settings_applications',
  'Update app': 'system_update_alt',
  'Update service': 'sync'
}

export const icon = name => iconList[name] || 'description'
