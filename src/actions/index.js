/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PROVIDER } from './constants'

export const setTitle = (title) => ({
  type: A.SET_TITLE,
  title,
})

export const setPage = (name, id = null) => ({
  type: A.SET_PAGE,
  page: { name, id },
})

export const resetPage = () => ({
  type: A.RESET_PAGE,
})

export const restorePage = () => ({
  type: A.RESTORE_PAGE,
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

export const setPrimary = prim => ({
  type: A.SET_PRIM,
  prim,
})

export const resetPrimary = () => ({
  type: A.RESET_PRIM,
})

export const setProvider = provider => ({
  type: A.SET_PROVIDER,
  provider,
})

export const resetProvider = () => ({
  type: A.RESET_PROVIDER,
})

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
  type: A.RESET_PASSWORD
})

export const setError = error => ({
  type: A.SET_ERROR,
  error,
})

export const resetError = () => ({
  type: A.RESET_ERROR
})

export const showError = (dispatch, error) => {
  dispatch(setError(error))
  dispatch(setPage('error'))
}

export const hideError = (dispatch) => {
  dispatch(resetError())
  dispatch(restorePage())
}

export const setStatus = (dispatch, json) => {
  dispatch(resetPassword())
  if (json.prim) {
    dispatch(setSession(json.sess))
    dispatch(setPrimary(json.prim))
  } else {
    dispatch(resetSession())
    dispatch(resetPrimary())
    dispatch(resetProvider())
  }
  dispatch(resetPrivilege())
  if (!json.errors) {
    dispatch(setTitle(json.title))
    dispatch(resetAuthId())
    dispatch(resetPage())
  } else {
    showError(dispatch, json.errors)
  }
}

export const doSingInWithPassword = () => (dispatch, getState) => {
  dispatch(setProvider(PROVIDER.PASSWORD))
  return fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getState().auth),
    credentials: 'same-origin',
  })
  .then(res => res.json())
  .then(json => setStatus(dispatch, json))
}

export const doSingOut = () => dispatch => {
  return fetch('/api/sessions', {
    method: 'DELETE',
    credentials: 'same-origin',
  })
  .then(res => res.json())
  .then(json => setStatus(dispatch, json))
}
