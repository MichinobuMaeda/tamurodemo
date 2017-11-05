/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const helps = (state = [], action) => {
  switch (action.type) {
  case A.SET_HELP_ALL:
    return [...action.helps]
  case A.SET_HELP_MD:
    return state.map(h => h.pid === action.pid
      ? {
        ...h,
        val: action.val,
        edited: true,
      }
      : h
    )
  case A.SET_HELP:
    return state.map(h => h.pid === action.help.pid
      ? action.help
      : h
    )
  default:
    return state
  }
}

export default helps
