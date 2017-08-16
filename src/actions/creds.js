/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PAGE } from '../constants'
import { apiGetUsersProviders } from './apis'
import { setWait, resetWait, setPage } from './view'

export const setCred = (cred) => ({
  type: A.SET_CRED,
  cred,
})

export const resetCred = (provider) => ({
  type: A.RESET_CRED,
  provider,
})

export const setCreds = (creds) => ({
  type: A.SET_CREDS,
  creds,
})

export const resetCreds = () => ({
  type: A.RESET_CREDS,
})

export const showCredentials = uid => async (dispatch, getState) => {
  dispatch(setWait())
  let res = await apiGetUsersProviders(uid)
  dispatch(setCreds(res))
  dispatch(setPage(PAGE.CREDENTIAL, uid))
  dispatch(resetWait())
}
