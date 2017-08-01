/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

export const A = {
  SET_TITLE: 'SET_TITLE',

  SET_PAGE: 'SET_PAGE',
  RESET_PAGE: 'RESET_PAGE',
  RESTORE_PAGE: 'RESTORE_PAGE',

  SET_SESS: 'SET_SESS',
  RESET_SESS: 'RESET_SESS',

  SET_PRIV: 'SET_PRIV',
  RESET_PRIV: 'RESET_PRIV',

  SET_PRIM: 'SET_PRIM',
  RESET_PRIM: 'RESET_PRIM',

  SET_PROVIDER: 'SET_PROVIDER',
  RESET_PROVIDER: 'RESET_PROVIDER',

  SET_AUTH_ID: 'SET_AUTH_ID',
  RESET_AUTH_ID: 'RESET_AUTH_ID',

  SET_PASSWORD: 'SET_PASSWORD',
  RESET_PASSWORD: 'RESET_PASSWORD',

  SET_ERROR: 'SET_ERROR',
  RESET_ERROR: 'RESET_ERROR',

  SET_WAIT: 'SET_WAIT',
  RESET_WAIT: 'RESET_WAIT',
}

export const PRIV = {
  USER: 'PRIV_USER',
  MANAGER: 'PRIV_MANAGER',
  ADMIN: 'PRIV_ADMIN',
}

export const PROVIDER = {
  PASSWORD: 'password',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
}

export const ERR = {
  REQUIRED: 'required',
  UNIQUE: 'unique',
  ARRAY: 'array',
  REFERENCE: 'reference',
  LATEST: 'latest',
  AUTH: 'auth',
  SIGNIN: 'signin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MANAGER_OR_SELF: 'managerOrSelf',
}
