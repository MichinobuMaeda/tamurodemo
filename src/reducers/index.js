/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {combineReducers} from 'redux'

import status from './status'
import pages from './pages'
import groups from './groups'
import users from './users'
import signin from './signin'
import errors from './errors'
import helps from './helps'
import confirmation from './confirmation'
import invitees from './invitees'
import sessions from './sessions'
import logs from './logs'

const tamuroApp = combineReducers({
  status,
  pages,
  groups,
  users,
  signin,
  errors,
  helps,
  confirmation,
  invitees,
  sessions,
  logs,
})

export default tamuroApp
