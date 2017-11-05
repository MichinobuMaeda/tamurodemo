/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE, PROVIDER} from '../constants'
import {
  getTop, getUser, deleteMySession, createSession,
  revokeManager, revokeAdmin, updateTitle
} from './api'
import {setPage, resetPage, backPage} from './pages'
import {resetGroups} from './groups'
import {setUser, resetUsers} from './users'
import {selectCert, resetSignInCerts} from './signin'
import {gotoErrorPage} from './errors'

export const setStatus = status => ({
  type: A.SET_STATUS,
  status,
})

export const setTitle = (val, ver) => ({
  type: A.SET_TITLE,
  val,
  ver,
})

export const setEditMode = (editMode) => ({
  type: A.SET_EDIT_MODE,
  editMode,
})

export const setScrollTop = (scrollTop) => ({
  type: A.SET_SCROLL_TOP,
  scrollTop,
})

export const selectStartPage = session => session && session.uid
  ? session.provider === PROVIDER.TOKEN
    ? PAGE.WELCOME
    : PAGE.TOP
  : PAGE.GUEST

export const resetStatus = async (dispatch, status, pageName) => {
  dispatch(resetPage(pageName, status.session ? status.session.uid : null))
  dispatch(setStatus(status))
  dispatch(resetGroups())
  dispatch(resetUsers())
  dispatch(resetSignInCerts())
  status.session && status.session.uid &&
    dispatch(setUser(await getUser(status.session.uid)))
}

export const resetContent = () => async (dispatch) => {
  let status = await getTop()
  document.title = status.title.val
  await resetStatus(dispatch, status, selectStartPage(status.session))
}

export const init = (store) => resetContent()(store.dispatch)

export const gotoHome = () => async(dispatch, getState) => {
  dispatch(setStatus(await getTop()))
  let {status} = getState()
  dispatch(setPage(selectStartPage(status.session)))
}

export const revokeManagerAndRestStatus = () => async dispatch => {
  await resetStatus(dispatch, await revokeManager(), PAGE.TOP)
}

export const revokeAdminAndRestStatus = () => async dispatch => {
  await resetStatus(dispatch, await revokeAdmin(), PAGE.TOP)
}

export const signOut = () => async dispatch => {
  await resetStatus(dispatch, await deleteMySession(), PAGE.GOODBYE)
}

export const signInWithPassword = ()=> async (dispatch, getState) => {
  const {signin} = getState()
  const {id, password} = selectCert(signin, PROVIDER.PASSWORD)
  const provider = PROVIDER.PASSWORD
  const status = await createSession({provider, id, password})
  if (status.errors) {
    dispatch(gotoErrorPage(status.errors))
  } else {
    await resetStatus(dispatch, status, PAGE.TOP)
  }
}

export const commitEditedTitle = () => async (dispatch, getState) => {
  const res = await updateTitle(getState().status.title)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setEditMode(false))
    dispatch(setTitle(res.val, res.ver))
    document.title = getState().status.title.val
    dispatch(backPage(true))
  }
}

export const discardEditedTitle = () => async (dispatch, getState) => {
  dispatch(setEditMode(false))
  if (getState().status.title.edited) {
    const res = await getTop()
    if (res.errors) {
      dispatch(backPage(true))
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setTitle(res.title.val, res.title.ver))
      dispatch(backPage(true))
    }
  } else {
    dispatch(backPage(true))
  }
}
