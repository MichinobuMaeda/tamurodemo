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
import auth from './auth'
import error from './error'
import wait from './wait'
import groups from './groups'
import users from './users'
import creds from './creds'
import logs from './logs'
import sessions from './sessions'
import dialog from './dialog'

const tamuroApp = combineReducers({
  title,
  page,
  sess,
  prim,
  auth,
  error,
  wait,
  groups,
  users,
  creds,
  logs,
  sessions,
  dialog,
})

export default tamuroApp
