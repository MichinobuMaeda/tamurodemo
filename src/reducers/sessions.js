/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const sessions = (state = [], action) => {
  const sids = state.map(sess => sess._id)
  switch (action.type) {
  case A.SET_SESSIONS:
    return [
      ...action.sessions,
    ]
  case A.UPDATE_SESSIONS:
    return [
      ...action.sessions.filter(sess => 0 > sids.indexOf(sess._id)),
      ...state,
    ]
  case A.APPEND_SESSIONS:
    return [
      ...state,
      ...action.sessions.filter(sess => 0 > sids.indexOf(sess._id)),
    ]
  default:
    return state
  }
}

export default sessions
