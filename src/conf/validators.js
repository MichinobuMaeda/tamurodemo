
export const validateRequired = v => !!v
export const validateEmail = v => (!v) || /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(v)
export const validatePassword = v => (!v) || (v.length >= 8)
export const validateURL = v => (!v) || /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(v)
