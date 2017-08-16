/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PAGE, PROVIDER } from '../constants'
import {
  apiPostSession, apiPostUsersProvider,
  apiPutUsersProvider, apiDeleteUsersProvider
} from './apis'
import { setPage, setWait, resetWait } from './view'
import { setCred, resetCred, } from './creds'
import { setStatus, } from './auth'
import { showError } from './error'

export const setAuthId = authId => ({
  type: A.SET_AUTH_ID,
  authId,
})

export const resetAuthId = () => ({
  type: A.RESET_AUTH_ID,
})

export const setPassword = password => ({
  type: A.SET_PASSWORD,
  password,
})

export const resetPassword = () => ({
  type: A.RESET_PASSWORD,
})

export const setCredAuthId = (authId) => ({
  type: A.SET_CRED_AUTH_ID,
  authId,
})

export const setCredPassword = (password) => ({
  type: A.SET_CRED_PASSWORD,
  password,
})

export const doSingInWithPassword = () => async (dispatch, getState) => {
  dispatch(setWait())
  let res = await apiPostSession({
    ...(getState().password),
    provider: PROVIDER.PASSWORD,
  })
  await setStatus(dispatch, res)
  dispatch(resetWait())
}

export const committedAuthIdPassword = async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, null)
  let res = cred._id
    ? await apiPutUsersProvider(cred)
    : await apiPostUsersProvider({ ...cred, uid: getState().sess.uid })
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    dispatch(setCred(res))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}

export const disabledPassword = async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, null)
  let res = await apiDeleteUsersProvider(cred)
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    dispatch(resetCred(PROVIDER.PASSWORD))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}
