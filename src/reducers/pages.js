/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE} from '../constants'

const origin = {
  history: [{name: PAGE.GUEST, id: null}],
  curr: 0,  current: () => this.history[this.curr]
}

const pages = (state = origin, action) => {
  let {history, curr} = state
  switch (action.type) {
  case A.SET_PAGE:
    return (history[curr].name === action.page.name &&
            history[curr].id === action.page.id)
      ? state
      : {
        history: history.slice(0, curr + 1).concat(action.page),
        curr: curr + 1,
      }
  case A.RESET_PAGE:
    return {
      history: [{...action.page}],
      curr: 0,
    }
  case A.BACK_PAGE:
    return action.reset
      ? {
        history: history.slice(0, Math.max(1, curr)),
        curr: Math.max(0, curr - 1),
      }
      : {
        history,
        curr: Math.max(0, curr - 1),
      }
  case A.FORWARD_PAGE:
    return {
      history,
      curr: Math.min(history.length, curr + 1),
    }
  default:
    return state
  }
}

export default pages
