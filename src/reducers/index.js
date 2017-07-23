/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { combineReducers } from 'redux'

import title from './title'
import page from './page'
import privilege from './privilege'
import primary from './primary'

const tamuroApp = combineReducers({
  title,
  page,
  privilege,
  primary,
})

export default tamuroApp
