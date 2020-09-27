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
  'Save': 'done',
  'E-mail': 'mail',
  'Visible': 'visibility',
  'Invisible': 'visibility_off',
  'Send': 'send',
  'Defaults': 'settings_applications',
  'Update app': 'system_update_alt',
  'Update service': 'sync',
  'Service settings': 'settings',
  'Raw data': 'memory'
}

const icons = name => iconList[name] || 'description'

export default icons
