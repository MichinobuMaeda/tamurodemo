/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

export const LOG_LEVEL = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
}

export const METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
}

export const PROVIDER = {
  TOKEN: 'TOKEN',
  PASSWORD: 'PASSWORD',
  GOOGLE: 'GOOGLE',
}

export const GROUP_ROLE = {
  TOP: 'TOP',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
}

export const PRIV = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OWNER: 'OWNER',
  USER: 'USER',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
}

export const PREFERENCE = {
  TITLE: 'TITLE',
  HELP_ADMIN: 'HELP_ADMIN',
  HELP_MANAGER: 'HELP_MANAGER',
  HELP_MEMBER: 'HELP_MEMBER',
  HELP_GUEST: 'HELP_GUEST',
}

export const ERRORS = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  CERT_CREATED: 'CERT_CREATED',
  DATA_REVISED: 'DATA_REVISED',
  CERT_MISSED: 'CERT_MISSED',
}
