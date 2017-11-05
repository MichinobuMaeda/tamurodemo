/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const confirmation = (state = {}, action) => {
  switch (action.type) {
  case A.SET_CONFIRMATION:
    return {...action.confirmation}
  default:
    return state
  }
}

export default confirmation
