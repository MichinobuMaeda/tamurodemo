/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const sessions = (state = [], action) => {
  switch (action.type) {
    case A.SET_SESSIONS:
      return action.sessions
    case A.RESET_SESSIONS:
      return []
    default:
      return state
  }
}

export default sessions
