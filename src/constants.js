'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

export const providers = [
  'password',
].reduce((ret, e) => { ret[e] = e; return ret }, {})

export const errors = [
  'required',
  'string',
  'number',
  'date',
  'array',
  'object',
  'provider',
  'reference',
  'unique',
  'match',
  'conflict',
  'auth',
  'signin',
  'priv',
  'expire',
].reduce((ret, e) => {
  ret[e] = (path) => ({ path: path, error: e })
  return ret 
}, {})
