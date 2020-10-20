const validateEmail = v => (!v) || /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(v)
const validatePassword = v => (!v) || (v.length >= 8)
const validateURL = v => (!v) || /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(v)

export const validators = (state, root) => {
  return {
    ruleRequired: v => !!v || root.$i18n.t('Required'),
    ruleEmail: v => validateEmail(v) || root.$i18n.t('Invalid E-mail format'),
    rulePassword: v => validatePassword(v) || root.$i18n.t('Invalid password'),
    ruleUrl: v => validateURL(v) || root.$i18n.t('Invalid URL format')
  }
}
