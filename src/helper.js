'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import crypto from 'crypto'

export const isUndefined = (v) => Object.prototype.toString.call(v) === '[object Undefined]'
export const isNull = (v) =>  Object.prototype.toString.call(v) === '[object Null]'
export const isString = (v) =>  Object.prototype.toString.call(v) === '[object String]'
export const isNumber = (v) =>  Object.prototype.toString.call(v) === '[object Number]'
export const isDate = (v) =>  Object.prototype.toString.call(v) === '[object Date]'
export const isObject = (v) => Object.prototype.toString.call(v) === '[object Object]'
export const isArray = (v) => Object.prototype.toString.call(v) === '[object Array]'
export const isStringFilled = (v) =>  isString(v) && v.length > 0

export const digestPassword = (uid, password, seed) => {
  let hash = crypto.createHash('sha256')
  hash.update(`${uid}:${seed}:${password}`)
  return hash.digest('hex')
}
