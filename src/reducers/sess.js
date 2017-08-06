/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const sess = (state = {}, action) => {
  switch (action.type) {
    case A.SET_SESS:
      return action.sess
    case A.RESET_SESS:
      return {}
    default:
      return state
  }
}

export default sess
