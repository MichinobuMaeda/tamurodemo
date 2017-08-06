/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PROVIDER } from './constants'

export const setTitle = (title) => ({
  type: A.SET_TITLE,
  title,
})

export const setPage = (name, id = null) => ({
  type: A.SET_PAGE,
  page: { name, id },
})

export const resetPage = () => ({
  type: A.RESET_PAGE,
})

export const backPage = () => ({
  type: A.BACK_PAGE,
})

export const forwardPage = () => ({
  type: A.FORWARD_PAGE,
})

export const setSession = sess => ({
  type: A.SET_SESS,
  sess,
})

export const resetSession = () => ({
  type: A.RESET_SESS,
})

export const setPrivilege = priv => ({
  type: A.SET_PRIV,
  priv,
})

export const resetPrivilege = () => ({
  type: A.RESET_PRIV,
})

export const setPrimary = prim => ({
  type: A.SET_PRIM,
  prim,
})

export const resetPrimary = () => ({
  type: A.RESET_PRIM,
})

export const setProvider = provider => ({
  type: A.SET_PROVIDER,
  provider,
})

export const resetProvider = () => ({
  type: A.RESET_PROVIDER,
})

export const setAuthId = authId => ({
  type: A.SET_AUTH_ID,
  authId,
})

export const resetAuthId = () => ({
  type: A.RESET_AUTH_ID,
})

export const setPassword = password => ({
  type: A.SET_PASSWORD,
  password,
})

export const resetPassword = () => ({
  type: A.RESET_PASSWORD,
})

export const setError = error => ({
  type: A.SET_ERROR,
  error,
})

export const resetError = () => ({
  type: A.RESET_ERROR,
})

export const setWait = () => ({
  type: A.SET_WAIT,
})

export const resetWait = () => ({
  type: A.RESET_WAIT,
})

export const setGroups = (groups) => ({
  type: A.SET_GROUPS,
  groups,
})

export const resetGroups = () => ({
  type: A.RESET_GROUPS,
})

export const setUsers = (users) => ({
  type: A.SET_USERS,
  users,
})

export const resetUsers = () => ({
  type: A.RESET_USERS,
})

export const showError = (dispatch, error) => {
  dispatch(setError(error))
  dispatch(setPage('error'))
}

export const hideError = (dispatch) => {
  dispatch(resetError())
  dispatch(backPage())
}

export const setStatus = async (dispatch, json) => {
  dispatch(resetPassword())
  if (json.prim) {
    dispatch(setSession(json.sess))
    dispatch(setPrimary(json.prim))
    let res = await fetch('/api/groups', {
      credentials: 'same-origin',
    })
    let groups = await res.json()
    dispatch(setGroups(groups))
  } else {
    dispatch(resetSession())
    dispatch(resetPrimary())
    dispatch(resetProvider())
    dispatch(resetGroups())
    dispatch(resetUsers())
  }
  dispatch(resetPrivilege())
  if (!json.errors) {
    dispatch(setTitle(json.title))
    dispatch(resetAuthId())
    dispatch(resetPage())
  } else {
    showError(dispatch, json.errors)
  }
}

export const doSingInWithPassword = () => async (dispatch, getState) => {
  dispatch(setWait())
  dispatch(setProvider(PROVIDER.PASSWORD))
  let res = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getState().auth),
    credentials: 'same-origin',
  })
  let json = await res.json()
  setStatus(dispatch, json)
  dispatch(resetWait())
}

export const doSingOut = () => async dispatch => {
  let res = await fetch('/api/sessions', {
    method: 'DELETE',
    credentials: 'same-origin',
  })
  let json = await res.json()
  setStatus(dispatch, json)
}
export const isUserPopulated = (users, uid) => users.reduce(
  (filled, u) => u._id === uid || filled, false)
export const isAllUsersPopulated = (users, uids) => uids.reduce(
  (ret, cur) => isUserPopulated(users, cur) && ret, true)

export const populateGroupUsers = async (dispatch, gid, groups, users) => {
  let group = groups.reduce((ret, cur) => cur._id === gid ? cur : ret, null)
  if (!isAllUsersPopulated(users, group.uids)) {
    let res = await fetch(`/api/groups/${gid}/users`, {
      credentials: 'same-origin',
    })
    let json = await res.json()
    dispatch(setUsers(json))
  }
}

export const showGroup = gid => async (dispatch, getState) => {
  dispatch(setWait())
  await populateGroupUsers(dispatch, gid, getState().groups, getState().users)
  dispatch(setPage('group', gid))
  dispatch(resetWait())
}
