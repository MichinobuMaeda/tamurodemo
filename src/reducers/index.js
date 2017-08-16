/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { combineReducers } from 'redux'

import title from './title'
import page from './page'
import sess from './sess'
import prim from './prim'
import password from './password'
import error from './error'
import wait from './wait'
import groups from './groups'
import users from './users'
import creds from './creds'
import editedGroup from './editedGroup'
import editedUser from './editedUser'
import logs from './logs'
import sessions from './sessions'
import alert from './alert'
import permission from './permission'

const tamuroApp = combineReducers({
  title,
  page,
  sess,
  prim,
  password,
  error,
  wait,
  groups,
  users,
  creds,
  editedGroup,
  editedUser,
  logs,
  sessions,
  alert,
  permission,
})

export default tamuroApp
