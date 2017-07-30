/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../actions/constants'

const error = (state = null, action) => {
  switch (action.type) {
    case A.SET_ERROR:
      return action.error
    case A.RESET_ERROR:
      return null
    default:
      return state
  }
}

export default error
