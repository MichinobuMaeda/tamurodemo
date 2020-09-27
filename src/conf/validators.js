
export const validateEmail = v => (!v) || /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(v)
export const validatePassword = v => (!v) || (v.length >= 8)
export const validateURL = v => (!v) || /^((http(s?)?):\/\/)?([wW]{3}\.)?[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/.test(v)
