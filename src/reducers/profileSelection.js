/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const profileSelection = (state = {}, action) => {
  switch (action.type) {
  case A.SET_PROFILE_SELECTION:
    return {open: action.open, tag: action.tag}
  default:
    return state
  }
}

export default profileSelection
