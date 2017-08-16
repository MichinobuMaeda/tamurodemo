/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const alert = (state = { open: false }, action) => {
  switch (action.type) {
    case A.OPEN_ALERT:
      return { ...action.alert, open: true }
    case A.CLOSE_ALERT:
      return { open: false }
    default:
      return state
  }
}

export default alert
