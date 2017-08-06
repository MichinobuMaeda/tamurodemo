/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A , PRIV } from '../constants'

const defaultPriv = PRIV.USER

const priv = (state = defaultPriv, action) => {
  switch (action.type) {
    case A.SET_PRIV:
      return action.priv
    case A.RESET_PRIV:
      return defaultPriv
    default:
      return state
  }
}

export default priv
