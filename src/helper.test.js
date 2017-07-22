'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {
  isUndefined,
  isNull,
  isString,
  isNumber,
  isDate,
  isObject,
  isArray,
  isStringFilled,
} from './helper'

test('isUndefined()', () => {
  var a
  expect(isUndefined(a)).toBeTruthy()
  expect(isUndefined(null)).toBeFalsy()
  expect(isUndefined(1)).toBeFalsy()
  expect(isUndefined('')).toBeFalsy()
  expect(isUndefined('1')).toBeFalsy()
  expect(isUndefined(new Date())).toBeFalsy()
  expect(isUndefined([])).toBeFalsy()
  expect(isUndefined({})).toBeFalsy()
})

test('isNull()', () => {
  var a
  expect(isNull(a)).toBeFalsy()
  expect(isNull(null)).toBeTruthy()
  expect(isNull(1)).toBeFalsy()
  expect(isNull('')).toBeFalsy()
  expect(isNull('1')).toBeFalsy()
  expect(isNull(new Date())).toBeFalsy()
  expect(isNull([])).toBeFalsy()
  expect(isNull({})).toBeFalsy()
})

test('isString()', () => {
  var a
  expect(isString(a)).toBeFalsy()
  expect(isString(null)).toBeFalsy()
  expect(isString(1)).toBeFalsy()
  expect(isString('')).toBeTruthy()
  expect(isString('1')).toBeTruthy()
  expect(isString(new Date())).toBeFalsy()
  expect(isString([])).toBeFalsy()
  expect(isString({})).toBeFalsy()
})

test('isNumber()', () => {
  var a
  expect(isNumber(a)).toBeFalsy()
  expect(isNumber(null)).toBeFalsy()
  expect(isNumber(1)).toBeTruthy()
  expect(isNumber('')).toBeFalsy()
  expect(isNumber('1')).toBeFalsy()
  expect(isNumber(new Date())).toBeFalsy()
  expect(isNumber([])).toBeFalsy()
  expect(isNumber({})).toBeFalsy()
})

test('isDate()', () => {
  var a
  expect(isDate(a)).toBeFalsy()
  expect(isDate(null)).toBeFalsy()
  expect(isDate(1)).toBeFalsy()
  expect(isDate('')).toBeFalsy()
  expect(isDate('1')).toBeFalsy()
  expect(isDate(new Date())).toBeTruthy()
  expect(isDate([])).toBeFalsy()
  expect(isDate({})).toBeFalsy()
})

test('isObject()', () => {
  var a
  expect(isObject(a)).toBeFalsy()
  expect(isObject(null)).toBeFalsy()
  expect(isObject(1)).toBeFalsy()
  expect(isObject('')).toBeFalsy()
  expect(isObject('1')).toBeFalsy()
  expect(isObject(new Date())).toBeFalsy()
  expect(isObject([])).toBeFalsy()
  expect(isObject({})).toBeTruthy()
})

test('isArray()', () => {
  var a
  expect(isArray(a)).toBeFalsy()
  expect(isArray(null)).toBeFalsy()
  expect(isArray(1)).toBeFalsy()
  expect(isArray('')).toBeFalsy()
  expect(isArray('1')).toBeFalsy()
  expect(isArray(new Date())).toBeFalsy()
  expect(isArray([])).toBeTruthy()
  expect(isArray({})).toBeFalsy()
})

test('isStringFilled()', () => {
  var a
  expect(isStringFilled(a)).toBeFalsy()
  expect(isStringFilled(null)).toBeFalsy()
  expect(isStringFilled(1)).toBeFalsy()
  expect(isStringFilled('')).toBeFalsy()
  expect(isStringFilled('1')).toBeTruthy()
  expect(isStringFilled(new Date())).toBeFalsy()
  expect(isStringFilled([])).toBeFalsy()
  expect(isStringFilled({})).toBeFalsy()
})
