const iconList = {
  'OK': 'check',
  'Cancel': 'close',
  'Top': 'home',
  'Sign in': 'account_circle',
  'Sign out': 'power_settings_new',
  'Privacy policy': 'privacy_tip',
  'Group': 'people',
  'User': 'person',
  'Profile and Settings': 'contact_page',
  'Service': 'settings',
  'Edit': 'edit',
  'Add': 'add',
  'Delete': 'delete',
  'E-mail': 'mail',
  'Visible': 'visibility',
  'Invisible': 'visibility_off',
  'Send': 'send',
  'Update app': 'system_update_alt',
  'Update service': 'system_update_alt',
  'Service settings': 'settings',
  'Raw data': 'memory'
}

const icons = name => iconList[name] || 'description'

export default icons
