/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const groups = (state = [], action) => {
  switch (action.type) {
    case A.SET_GROUP:
      return [
        ...(state.filter(g => g._id !== action.group._id)),
        action.group,
      ]
    case A.SET_GROUPS:
      return action.groups
    case A.RESET_GROUPS:
      return []
    default:
      return state
  }
}

export default groups
