/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const prim = (state = null, action) => {
  switch (action.type) {
    case A.SET_PRIM:
      return action.prim
    case A.RESET_PRIM:
      return null
    default:
      return state
  }
}

export default prim
