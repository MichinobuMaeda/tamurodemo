/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import A from '../actions/constants'

const homePage = { name: 'top' }

const page = (state = homePage, action) => {
  switch (action.type) {
    case A.SET_PAGE:
      return action.page
    case A.RESET_PAGE:
      return homePage
    default:
      return state
  }
}

export default page
