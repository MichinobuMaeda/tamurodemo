/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const auth = (state = {}, action) => {
  let {provider, authId, password} = state
  switch (action.type) {
    case A.SET_PROVIDER:
      return {provider: action.provider, authId, password}
    case A.RESET_PROVIDER:
      return {provider: null, authId, password}
    case A.SET_AUTH_ID:
      return {provider, authId: action.authId, password}
    case A.RESET_AUTH_ID:
      return {provider, authId: null, password}
    case A.SET_PASSWORD:
      return {provider, authId, password: action.password}
    case A.RESET_PASSWORD:
      return {provider, authId, password: null}
    default:
      return state
  }
}

export default auth
