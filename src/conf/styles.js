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
  iconMenu: 'fas fa-bars',
  iconTop: 'fas fa-home',
  iconSignIn: 'fas fa-sign-in-alt',
  iconPrivacyPolicy: 'fas fa-shield-alt',
  iconPreferences: 'fas fa-user-cog',
  iconService: 'fas fa-server',
  iconRawData: 'fas fa-microchip',
  iconAdd: 'fas fa-plus-circle',
  iconRemove: 'fas fa-minus-circle',
  iconRestore: 'fas fa-trash-restore',
  iconWarn: 'fas fa-exclamation-circle',
  iconEdit: 'fas fa-edit',
  iconClose: 'fas fa-times',
  iconDesc: 'far fa-comment-alt',
  iconUser: 'fas fa-user',
  iconAddUser: 'fas fa-user-plus',
  iconGroup: 'fas fa-users',
  iconTimezone: 'fas fa-globe',
  iconLocale: 'fas fa-language',
  iconLine: 'fab fa-line',
  iconFacebook: 'fab fa-facebook',
  iconGithub: 'fab fa-github',
  iconGoogle: 'fab fa-google',
  iconTwitter: 'fab fa-twitter',
  accountStatus: {
    blocked: 'fas fa-lock',
    invited: 'far fa-paper-plane',
    accepted: 'far fa-check-circle'
  }
}
