/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A  } from '../constants'

const wait = (state = true, action) => {
  switch (action.type) {
    case A.SET_WAIT:
      return true
    case A.RESET_WAIT:
      return false
    default:
      return state
  }
}

export default wait
