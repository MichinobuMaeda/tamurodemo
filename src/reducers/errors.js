/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const errors = (state = [], action) => {
  switch (action.type) {
  case A.SET_ERRORS:
    return [...action.errors]
  default:
    return state
  }
}

export default errors
