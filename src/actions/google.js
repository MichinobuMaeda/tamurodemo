/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { PAGE, PROVIDER } from '../constants'
import { GOOGLE_CLIENT_ID } from '../preferences'
import {
  apiPostSession, apiPostUsersProvider,
  apiPutUsersProvider, apiDeleteUsersProvider
} from './apis'
import { setPage, setWait, resetWait } from './view'
import { setCred, resetCred, } from './creds'
import { setStatus, } from './auth'
import { showError } from './error'

export const initGoogleApi = () => {
  const scripts = document.getElementsByTagName('script')
  let api = document.createElement('script')
  api.src = '//apis.google.com/js/client:platform.js'
  scripts[0].parentNode.insertBefore(api, scripts[0])
  api.onload = () => {
    window.gapi.load('auth2', () => {
      window.gapi.auth2.init({
        client_id: GOOGLE_CLIENT_ID,
      })
    })
  }
}

export const signInWithGoogle = (dispatch, onSuccess, onFailure) => async () => {
  try {
    const auth2 = window.gapi.auth2.getAuthInstance()
    let res = await auth2.signIn()
    dispatch(onSuccess(res))
  } catch (e) {
    dispatch(onFailure(e))
  }
}

export const doSingInWithGoogle = (googleUser) => async (dispatch, getState) => {
  dispatch(setWait())
  let res = await apiPostSession({
    provider: PROVIDER.GOOGLE,
    authId: googleUser.getAuthResponse().id_token,
  })
  await setStatus(dispatch, res)
  dispatch(resetWait())
}

export const failureSingInWithGoogle = (e) => async (dispatch) => {
  await setStatus(dispatch, { errors: [ { path: 'oauth2', req: PROVIDER.GOOGLE, e } ] })
}

export const connectGoogle = (googleUser) => async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.GOOGLE ? cur : ret, null)
  let res = cred
    ? await apiPutUsersProvider({
        ...cred,
        authId: googleUser.getAuthResponse().id_token,
      })
    : await apiPostUsersProvider({
      provider: PROVIDER.GOOGLE,
      uid: getState().sess.uid,
      authId: googleUser.getAuthResponse().id_token,
  })
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    dispatch(setCred(res))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}

export const disconnectGoogle = async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.GOOGLE ? cur : ret, null)
  let res = await apiDeleteUsersProvider(cred)
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    dispatch(resetCred(PROVIDER.GOOGLE))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}
