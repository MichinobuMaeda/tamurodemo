/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const invitees = (state = [], action) => {
  switch (action.type) {
  case A.SET_INVITEES:
    return [...action.invitees]
  default:
    return state
  }
}

export default invitees
