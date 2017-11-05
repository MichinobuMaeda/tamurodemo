/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE, ADMIN_GET_LOGS_TIME_SPAN} from '../constants'
import {setPage, currentPage} from './pages'
import {gotoErrorPage} from './errors'
import {getLogs} from './api'

export const setLogs = logs => ({
  type: A.SET_LOGS,
  logs,
})

export const appendLogs = logs => ({
  type: A.APPEND_LOGS,
  logs,
})

export const getFromTo = (logs, append)  => {
  const to = append && logs && logs.length
    ? new Date(logs[logs.length - 1].createdAt).getTime() + 1000
    : new Date().getTime()
  const from = !append && logs && logs.length
    ? new Date(logs[0].createdAt).getTime() - 1000
    : to - ADMIN_GET_LOGS_TIME_SPAN
  return {
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
  }
}

const updateLogs = append => async (dispatch, getState) => {
  const {logs, pages} = getState()
  const res = await getLogs(getFromTo(logs, append))
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(append ? appendLogs(res) : setLogs(res))
    if (currentPage(pages).name !== PAGE.LOGS) {
      dispatch(setPage(PAGE.LOGS))
    }
  }
}

export const showNewLogs = () => async dispatch => {
  await dispatch(updateLogs(false))
}

export const showOldLogs = () => async dispatch => {
  await dispatch(updateLogs(true))
}
