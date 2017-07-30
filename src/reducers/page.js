/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../actions/constants'

const homePage = { name: 'top' }

const page = (state = { history: [homePage], curr: 0 }, action) => {
  let { history, curr } = state
  switch (action.type) {
    case A.SET_PAGE:
      if (history[curr].name !== action.page.name || history[curr].id !== action.page.id) {
        history = [...history, action.page]
        curr = history.length - 1
      }
      return { history, curr }
    case A.RESET_PAGE:
      if (history[curr].name !== homePage.name || history[curr].id !== homePage.id) {
        history = [...history, homePage]
        curr = history.length - 1
      }
      return { history, curr }
    case A.RESTORE_PAGE:
      if (0 < curr) {
        history = history.filter((e, i) => i < history.length - 1)
        curr = history.length - 1
      }
      return { history, curr }
    default:
      return state
  }
}

export default page
