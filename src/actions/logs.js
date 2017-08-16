/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import Scroll from 'react-scroll'

import { A, PAGE } from '../constants'
import { apiGetLogs } from './apis'
import { setWait, resetWait, setPage } from './view'

const scroll = Scroll.animateScroll

export const setLogs = (logs) => ({
  type: A.SET_LOGS,
  logs,
})

export const resetLogs = () => ({
  type: A.RESET_LOGS,
})

export const showLogs = async (dispatch) => {
  const time = new Date().getTime()
  dispatch(setWait())
  let res = await apiGetLogs(time - 60 * 60 * 1000, time)
  dispatch(setLogs(res))
  dispatch(setPage(PAGE.LOGS))
  dispatch(resetWait())
}

export const getMoreLogs = async (dispatch, getState) => {
  const time = getState().logs.f + 1000
  dispatch(setWait())
  let res = await apiGetLogs(time - 60 * 61 * 1000, time)
  dispatch(setLogs(res))
  dispatch(setPage(PAGE.LOGS))
  dispatch(resetWait())
  scroll.scrollToBottom({
    duration: 0,
    delay: 0,
    smooth: false,
  })
}
