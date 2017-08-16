/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const users = (state = [], action) => {
  switch (action.type) {
    case A.SET_USER:
      return [
        ...(state.filter(u => u._id !== action.user._id)),
        action.user,
      ]
    case A.DELETE_USER:
      return [
        ...(state.filter(u => u._id !== action.uid)),
      ]
    case A.SET_USERS:
      return action.users.reduce((ret, cur) => [
        ...(ret.filter(u => u._id !== cur._id)),
        cur,
      ], state)
    case A.RESET_USERS:
      return []
    default:
      return state
  }
}

export default users
