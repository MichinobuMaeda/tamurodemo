/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import A from '../actions/constants'

const privilege = (state = null, action) => {
  switch (action.type) {
    case A.SET_PRIVILEGE:
      return action.privilege
    case A.RESET_PRIVILEGE:
      return null
    default:
      return state
  }
}

export default privilege
