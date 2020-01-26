// https://quasar.dev/style/color-palette
export default {
  pageTitle: 'text-h5 text-light-green-10',
  headerBg: 'teal-1',
  headerText: 'teal-10',
  footerBg: 'teal-1',
  footerText: 'teal-10',
  dlgCardStyle: 'width: 700px; max-width: 80vw;',
  dlgTitle: 'row items-center text-body1 text-white bg-',
  col1: 'col col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 q-pa-sm',
  col2: 'col col-xs-12 col-sm-8 col-md-6 col-lg-4 col-xl-4 q-pa-sm',
  showTabMaxWidth: 1024,
  menuBg: 'teal-7',
  menuText: 'white',
  menuItemBg: 'light-green-10',
  menuItemText: 'white',
  menuPositions: locale => [
    {
      label: /ja-/i.test(locale) ? '右下' : 'bottom-right',
      value: 'bottom-right'
    },
    {
      label: /ja-/i.test(locale) ? '左下' : 'bottom-left',
      value: 'bottom-left'
    },
    {
      label: /ja-/i.test(locale) ? '右上' : 'top-right',
      value: 'top-right'
    },
    {
      label: /ja-/i.test(locale) ? '左上' : 'top-left',
      value: 'top-left'
    }
  ],
  blankImage: 'statics/blank.png',
  iconMenu: 'menu',
  iconTop: 'home',
  iconSignIn: 'how_to_reg',
  iconSignOut: 'power_settings_new',
  iconPrivacyPolicy: 'policy',
  iconPreferences: 'build',
  iconService: 'cloud',
  iconRawData: 'memory',
  iconLimitedPriv: 'accessibility',
  iconAdd: 'add',
  iconRemove: 'delete_forever',
  iconRestore: 'restore_from_trash',
  iconWarn: 'warning',
  iconEdit: 'edit',
  iconClose: 'close',
  iconSend: 'send',
  iconReply: 'reply',
  iconUploadImage: 'add_photo_alternate',
  iconDesc: 'description',
  iconUser: 'person',
  iconAddUser: 'person_add',
  iconGroup: 'group',
  iconAddGroup: 'group_add',
  iconTimezone: 'access_time',
  iconLocale: 'language',
  iconEmail: 'mail_outline',
  iconPassword: 'vpn_key',
  iconChat: 'message',
  iconInquire: 'question_answer',
  iconFav: 'favorite',
  iconLike: 'thumb_up',
  iconInfo: 'list',
  iconLine: 'fab fa-line',
  iconFacebook: 'fab fa-facebook',
  iconGithub: 'fab fa-github',
  iconGoogle: 'fab fa-google',
  iconTwitter: 'fab fa-twitter',
  accountStatus: {
    blocked: 'lock',
    invited: 'message',
    accepted: 'verified_user'
  }
}
