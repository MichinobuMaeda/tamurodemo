/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import A from '../actions/constants'

const primary = (state = null, action) => {
  switch (action.type) {
    case A.SET_PRIMARY:
      return action.primary
    case A.RESET_PRIMARY:
      return null
    default:
      return state
  }
}

export default primary
