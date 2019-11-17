const validators = {
  password: str => (!str) || (str.length >= 8 && str.match(/\d/) && str.match(/\D/)),
  email: str => (!str) || /^(\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+|none)$/.test(str),
  integer: str => /^[-+]?[1-9][0-9]*$/.test(str)
}

export default validators
