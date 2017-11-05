/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

export const setSignInId = id => ({
  type: A.SET_SIGN_IN_ID,
  id,
})

export const setSignInPassword = password => ({
  type: A.SET_SIGN_IN_PASSWORD,
  password,
})

export const setConfirm = confirm => ({
  type: A.SET_SIGN_IN_CONFIRM,
  confirm,
})

export const resetSignInCerts = () => ({
  type: A.RESET_SIGN_IN_CERTS,
})

export const selectCert = (certs, provider, initial={}) =>
  certs.reduce((ret, cur) => cur.provider === provider ? cur : ret, initial)
