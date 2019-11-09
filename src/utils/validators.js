export const validatePassword = str => (str.length >= 8 && str.match(/\d/) && str.match(/\D/))
export const validateEmail = str => /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(str)
export const validateInteger = str => /^[-+]?[0-9]+$/.test(str)
