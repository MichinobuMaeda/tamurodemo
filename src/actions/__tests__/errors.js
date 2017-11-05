/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'

import {ERRORS} from '../../constants'
import reducers from '../../reducers'
import {setErrors, resetErrors} from '../errors'

jest.mock('../api')

var store = null

beforeEach(() => {
  store = createStore(
    reducers,
    applyMiddleware(thunk),
  )
})

test('setErrors', () => {
  const errors = [{error: ERRORS.CERT_CREATED, params: {}}]
  store.dispatch(setErrors(errors))
  expect(store.getState().errors).toEqual(errors)
})

test('resetErrors', () => {
  store.dispatch(resetErrors())
  expect(store.getState().errors).toEqual([])
})
