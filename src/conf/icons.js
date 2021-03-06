import { defaultIcons } from '../components/defaults'

const iconList = {
  ...defaultIcons,
  Top: 'home',
  'Sign in': 'login',
  'Sign out': 'power_settings_new',
  Password: 'vpn_key',
  'Privacy policy': 'policy',
  Categories: 'label',
  Category: 'label',
  Groups: 'group',
  Group: 'group',
  Members: 'supervised_user_circle',
  Users: 'person',
  User: 'person',
  Profile: 'person',
  'For all': 'sentiment_satisfied_alt',
  'For permitted': 'supervised_user_circle',
  'For managers': 'lock',
  Administration: 'admin_panel_settings',
  'Contact the supervisor': 'contact_mail',
  'Service settings': 'miscellaneous_services',
  Upward: 'arrow_upward',
  Downward: 'arrow_downward',
  'Top Left': 'north_west',
  'Top Right': 'north_east',
  'Bottom Left': 'south_west',
  'Bottom Right': 'south_east',
  'E-mail': 'mail',
  Invitation: 'textsms',
  Sent: 'send',
  Accepted: 'link',
  Timeout: 'link_off',
  Guide: 'emoji_people',
  Lock: 'lock',
  Unlock: 'lock_open',
  'Account deleted': 'delete',
  'Account locked': 'lock',
  Invited: 'textsms',
  'Invitation accepted': 'emoji_people',
  'Invitation timeout': 'sms_failed',
  'Account active': 'how_to_reg',
  'Account inactive': 'pause_circle_filled',
  'Signed in': 'link',
  'Not signed in': 'link_off',
  'Reset all sign-in settings': 'link_off',
  Visible: 'visibility',
  Invisible: 'visibility_off',
  Confirm: 'notifications',
  Send: 'send',
  Defaults: 'settings_applications',
  Preferences: 'settings',
  'Update app': 'system_update_alt',
  'Update service': 'sync',
  'Checkbox On': 'check_box',
  'Checkbox Off': 'check_box_outline_blank',
  'Confirm to add': 'add_circle_outline',
  'Confirm to remove': 'remove_circle_outline',
  Expand: 'expand_more',
  Shrink: 'expand_less',
  Chat: 'chat',
  'Go top': 'arrow_upward',
  'Go bottom': 'arrow_downward',
  Preview: 'preview',
  'Install app': 'get_app',
  Photo: 'image',
  'Add photo': 'add_photo_alternate',
  'Broken image': 'broken_image',
  'Rotate image': 'rotate_right',
  Description: 'description'
}

export const icon = name => iconList[name] || 'description'
