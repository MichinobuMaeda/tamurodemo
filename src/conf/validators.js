const validateEmail = v => (!v) || /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(v)
const validatePassword = v => (!v) || (v.length >= 8)
const validateURL = v => (!v) || /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(v)
const validateNotNegative = v => v >= 0
const validatePositiv = v => v > 0

export const validators = ({ $i18n }) => {
  return {
    ruleRequired: v => !!v || $i18n.t('Required'),
    ruleEmail: v => validateEmail(v) || $i18n.t('Invalid E-mail format'),
    rulePassword: v => validatePassword(v) || $i18n.t('Invalid password'),
    ruleUrl: v => validateURL(v) || $i18n.t('Invalid URL format'),
    ruleNotNegative: v => validateNotNegative(v) || $i18n.t('Should not be a negative number'),
    rulePositive: v => validatePositiv(v) || $i18n.t('Should be a positive number')
  }
}
