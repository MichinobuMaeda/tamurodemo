/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PROVIDER} from '../constants'

const signin = (state = [], action) => {
  switch (action.type) {
  case A.SET_SIGN_IN_ID:
    return [
      ...state.filter(c => c.provider !== PROVIDER.PASSWORD),
      state.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD
        ? {
          ...cur,
          id: action.id,
        }
        : ret,
      {
        provider: PROVIDER.PASSWORD,
        id: action.id,
      })
    ]
  case A.SET_SIGN_IN_PASSWORD:
    return [
      ...state.filter(c => c.provider !== PROVIDER.PASSWORD),
      state.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD
        ? {
          ...cur,
          password: action.password,
        }
        : ret,
      {
        provider: PROVIDER.PASSWORD,
        password: action.password,
      })
    ]
  case A.SET_SIGN_IN_CONFIRM:
    return [
      ...state.filter(c => c.provider !== PROVIDER.PASSWORD),
      state.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD
        ? {
          ...cur,
          confirm: action.confirm,
        }
        : ret,
      {
        provider: PROVIDER.PASSWORD,
        confirm: action.confirm,
      })
    ]
  case A.RESET_SIGN_IN_CERTS:
    return []
  default:
    return state
  }
}

export default signin
