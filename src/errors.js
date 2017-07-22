'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const errors = [
  'required',
  'unique',
  'array',
  'reference',
  'latest',
  'auth',
  'signin',
  'admin',
  'manager',
  'managerOrSelf',
].reduce((ret, req) => {
  ret[req] = (path = '') => ({ path, req })
  return ret
}, {})

export default errors
