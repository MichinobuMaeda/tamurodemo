/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const auth = (state = {}, action) => {
  switch (action.type) {
    case A.SET_AUTH_ID:
      return { ...state, authId: action.authId }
    case A.RESET_AUTH_ID:
      return { ...state, authId: null }
    case A.SET_PASSWORD:
      return { ...state, password: action.password }
    case A.RESET_PASSWORD:
      return { ...state, password: null }
    default:
      return state
  }
}

export default auth
