/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PRIV } from '../constants'

const defaultPriv = PRIV.USER

const sess = (state = { priv: defaultPriv }, action) => {
  switch (action.type) {
    case A.SET_SESS:
      return { ...action.sess, priv: defaultPriv }
    case A.RESET_SESS:
      return { priv: defaultPriv }
    case A.SET_PRIV:
      return { ...state, priv: action.priv }
    case A.RESET_PRIV:
      return { ...state, priv: defaultPriv }
    default:
      return state
  }
}

export default sess
