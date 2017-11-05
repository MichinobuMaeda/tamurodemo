/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE, ADMIN_GET_SESSIONS_TIME_SPAN} from '../constants'
import {STR} from '../preferences'
import {setPage, currentPage} from './pages'
import {CONFIRM_ACTION, setConfirmation} from './confirmation'
import {gotoErrorPage} from './errors'
import {getSessions, deleteSession} from './api'

export const setSessions = sessions => ({
  type: A.SET_SESSIONS,
  sessions,
})

export const updateSessions = sessions => ({
  type: A.UPDATE_SESSIONS,
  sessions,
})

export const appendSessions = sessions => ({
  type: A.APPEND_SESSIONS,
  sessions,
})

export const getFromTo = (sessions, append)  => {
  const to = append && sessions && sessions.length
    ? new Date(sessions[sessions.length - 1].updatedAt).getTime() + 1000
    : new Date().getTime()
  const from = !append && sessions && sessions.length
    ? new Date(sessions[0].updatedAt).getTime() - 1000
    : to - ADMIN_GET_SESSIONS_TIME_SPAN
  return {
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
  }
}

const updateOrAppendSessions = append => async (dispatch, getState) => {
  const {sessions, pages} = getState()
  const res = await getSessions(getFromTo(sessions, append))
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(append ? appendSessions(res) : updateSessions(res))
    if (currentPage(pages).name !== PAGE.SESSIONS) {
      dispatch(setPage(PAGE.SESSIONS))
    }
  }
}

export const showNewSessions = () => async dispatch => {
  await dispatch(updateOrAppendSessions(false))
}

export const showOldSessions = () => async dispatch => {
  await dispatch(updateOrAppendSessions(true))
}

export const confirmDeleteSession = sid => dispatch => {
  dispatch(setConfirmation({
    open: true,
    title: `session: "${sid}"`,
    message: STR.CONFIRM_DELETE,
    action: CONFIRM_ACTION.DELETE_SESSION,
    id: sid,
  }))
}

export const commitDeleteSession = sid => async (dispatch, getState) => {
  const {sessions} = getState()
  dispatch(setConfirmation({}))
  const res = await deleteSession(sid)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    const res = await getSessions({
      from: new Date(sessions.reduce(
        (ret, cur) => Math.min(ret, new Date(cur.updatedAt).getTime()),
        new Date().getTime() - ADMIN_GET_SESSIONS_TIME_SPAN
      )).toISOString(),
      to: new Date().toISOString(),
    })
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setSessions(res))
    }
  }
}
