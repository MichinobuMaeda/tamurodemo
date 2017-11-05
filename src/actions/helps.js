/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE} from '../constants'
import {getHelps, updateHelp} from './api'
import {setEditMode} from './status'
import {setPage, backPage} from './pages'
import {gotoErrorPage} from './errors'

export const setHelps = helps => ({
  type: A.SET_HELP_ALL,
  helps,
})

export const setHelpMd = (pid, val) => ({
  type: A.SET_HELP_MD,
  pid,
  val,
})

export const setHelp = help => ({
  type: A.SET_HELP,
  help,
})

export const gotoHelp = () => async dispatch => {
  const res = await getHelps()
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setHelps(res))
    dispatch(setPage(PAGE.HELP))
  }
}

export const commitEditedHelp = pid => async (dispatch, getState) => {
  const res = await updateHelp(
    getState().helps.reduce((ret, cur) => cur.pid === pid ? cur : ret, {})
  )
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setEditMode(false))
    dispatch(setHelp(res))
    dispatch(backPage(true))
  }
}

export const discardEditedHelp = pid => async (dispatch, getState) => {
  dispatch(setEditMode(false))
  const help = getState().helps.reduce((ret, cur) => cur.pid === pid ? cur : ret, {})
  if (help.edited) {
    dispatch(backPage(true))
    await dispatch(gotoHelp())
  } else {
    dispatch(backPage(true))
  }
}
