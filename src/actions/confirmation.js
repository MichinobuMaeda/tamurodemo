/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'
import {confirmDeleteGroup, commitDeleteGroup} from './groups'
import {
  confirmDeleteUser, commitDeleteUser,
  confirmDeletePassword, commitDeletePassword
} from './users'
import {confirmDeleteSession, commitDeleteSession} from './sessions'

export const setConfirmation = confirmation => ({
  type: A.SET_CONFIRMATION,
  confirmation,
})

export const CONFIRM_ACTION = {
  DELETE_GROUP: 'DELETE_GROUP',
  DELETE_USER: 'DELETE_USER',
  DELETE_SESSION: 'DELETE_SESSION',
  DELETE_PASSWORD: 'DELETE_PASSWORD',
}

export const requestConfirm = (action, id) => {
  switch (action) {
  case CONFIRM_ACTION.DELETE_GROUP: return confirmDeleteGroup(id)
  case CONFIRM_ACTION.DELETE_USER: return confirmDeleteUser(id)
  case CONFIRM_ACTION.DELETE_SESSION: return confirmDeleteSession(id)
  case CONFIRM_ACTION.DELETE_PASSWORD: return confirmDeletePassword(id)
  default: return
  }
}

export const doConfirmedAction = ({action, id}) =>  {
  switch (action) {
  case CONFIRM_ACTION.DELETE_GROUP: return commitDeleteGroup(id)
  case CONFIRM_ACTION.DELETE_USER: return commitDeleteUser(id)
  case CONFIRM_ACTION.DELETE_SESSION: return commitDeleteSession(id)
  case CONFIRM_ACTION.DELETE_PASSWORD: return commitDeletePassword(id)
  default: return null
  }
}
