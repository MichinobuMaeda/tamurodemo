/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const logs = (state = [], action) => {
  const lids = state.map(log => log._id)
  switch (action.type) {
  case A.SET_LOGS:
    return [
      ...action.logs.filter(log => 0 > lids.indexOf(log._id)),
      ...state,
    ]
  case A.APPEND_LOGS:
    return [
      ...state,
      ...action.logs.filter(log => 0 > lids.indexOf(log._id)),
    ]
  default:
    return state
  }
}

export default logs
