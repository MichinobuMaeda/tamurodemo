/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PROVIDER } from '../constants'

const creds = (state = [], action) => {
  switch (action.type) {
    case A.SET_CRED:
      return [
        ...(state.filter(cred => cred.provider !== action.cred.provider)),
        action.cred,
      ]
    case A.SET_CRED_AUTH_ID:
      return [
        ...(state.filter(cred => cred.provider !== PROVIDER.PASSWORD)),
        {
          ...(state.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, { provider: PROVIDER.PASSWORD })),
          authId: action.authId
        },
      ]
    case A.SET_CRED_PASSWORD:
      return [
        ...(state.filter(cred => cred.provider !== PROVIDER.PASSWORD)),
        {
          ...(state.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, { provider: PROVIDER.PASSWORD })),
          password: action.password
        },
      ]
  case A.RESET_CRED:
      return [
        ...(state.filter(cred => cred.provider !== action.provider)),
      ]
    case A.SET_CREDS:
      return action.creds
    case A.RESET_CREDS:
      return []
    default:
      return state
  }
}

export default creds
