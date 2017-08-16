/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'
import { apiDeleteSession } from './apis'
import { resetPage, closeAlert } from './view'
import { resetAuthId, resetPassword } from './password'
import { resetGroups, syncGroups, resetFormGroup } from './groups'
import { resetUsers } from './users'
import { resetLogs } from './logs'
import { resetSessions } from './sessions'
import { showError } from './error'

export const setTitle = (title) => ({
  type: A.SET_TITLE,
  title,
})

export const setPrimary = prim => ({
  type: A.SET_PRIM,
  prim,
})

export const resetPrimary = () => ({
  type: A.RESET_PRIM,
})

export const setSession = sess => ({
  type: A.SET_SESS,
  sess,
})

export const resetSession = () => ({
  type: A.RESET_SESS,
})

export const setPrivilege = priv => ({
  type: A.SET_PRIV,
  priv,
})

export const resetPrivilege = () => ({
  type: A.RESET_PRIV,
})

export const setStatus = async (dispatch, json) => {
  dispatch(resetPassword())
  if (json.prim) {
    dispatch(setSession(json.sess))
    dispatch(setPrimary(json.prim))
    syncGroups(dispatch)
  } else {
    dispatch(resetSession())
    dispatch(resetPrimary())
    dispatch(resetGroups())
    dispatch(resetUsers())
    dispatch(resetFormGroup())
    dispatch(resetLogs())
    dispatch(resetSessions())
    dispatch(closeAlert())
  }
  if (!json.errors) {
    dispatch(setTitle(json.title))
    dispatch(resetAuthId())
    dispatch(resetPage())
  } else {
    showError(dispatch, json.errors)
  }
}

export const doSingOut = () => async dispatch => {
  let res = await apiDeleteSession()
  await setStatus(dispatch, res)
}

export const onPrivilegeSelected = (dispatch, priv) => {
  dispatch(resetPage())
  dispatch(resetUsers())
  dispatch(setPrivilege(priv))
}
