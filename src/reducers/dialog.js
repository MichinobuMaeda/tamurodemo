/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const dialog = (state = { open: false }, action) => {
  switch (action.type) {
    case A.OPEN_DIALOG:
      return { ...action.dialog, open: true }
    case A.CLOSE_DIALOG:
      return { open: false }
    default:
      return state
  }
}

export default dialog
