/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const editedGroup = (state = {}, action) => {
  switch (action.type) {
    case A.SET_FORM_GROUP:
      return action.group
    case A.UPDATE_FORM_GROUP:
      let ret = {...state}
      ret[action.key] = action.value
      return ret
    case A.UPDATE_FORM_GROUP_PARENT:
      return {
        ...state,
        parents: [
          ...(state.parents.filter(gid => gid !== action.gid)),
          ...(action.checked ? [action.gid] : [])
        ].sort()
      }
    case A.RESET_FORM_GROUP:
      return {}
    default:
      return state
  }
}

export default editedGroup
