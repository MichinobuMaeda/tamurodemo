/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PAGE } from '../constants'
import { setPage, backPage } from './view'

export const setError = error => ({
  type: A.SET_ERROR,
  error,
})

export const resetError = () => ({
  type: A.RESET_ERROR,
})

export const showError = (dispatch, error) => {
  dispatch(setError(error))
  dispatch(setPage(PAGE.ERROR))
}

export const hideError = (dispatch) => {
  dispatch(resetError())
  dispatch(backPage())
}
