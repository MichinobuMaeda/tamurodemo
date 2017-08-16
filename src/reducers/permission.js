/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const permission = (state = { open: false, p: [] }, action) => {
  switch (action.type) {
    case A.OPEN_PERMISSION: {
      return {
        open: true,
        ...action.permission,
      }
    }
    case A.SET_PERMISSION: {
      return {
        ...state,
        p: [
          ...(state.p.filter(gid => gid !== action.gid)),
          ...(action.checked ? [action.gid] : [])
        ]
      }
    }
    case A.CLOSE_PERMISSION: {
      return { ...state, open: false }
    }
    default: {
      return state
    }
  }
}

export default permission
