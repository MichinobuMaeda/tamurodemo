/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PAGE } from '../constants'
import { apiGetSessions } from './apis'
import { setWait, resetWait, setPage } from './view'

export const setSessions = (sessions) => ({
  type: A.SET_SESSIONS,
  sessions,
})

export const resetSessions = () => ({
  type: A.RESET_SESSIONS,
})

export const showSessions = async (dispatch) => {
  dispatch(setWait())
  let res = await apiGetSessions()
  dispatch(setSessions(res))
  dispatch(setPage(PAGE.SESSIONS))
  dispatch(resetWait())
}
