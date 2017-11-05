/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE} from '../constants'
import {setPage} from './pages'

export const setErrors = errors => ({
  type: A.SET_ERRORS,
  errors,
})

export const gotoErrorPage = errors => dispatch => {
  dispatch(setErrors(errors))
  dispatch(setPage(PAGE.ERRORS))
}
