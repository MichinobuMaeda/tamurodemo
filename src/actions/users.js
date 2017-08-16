/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PAGE, ERR } from '../constants'
import {
  apiPostGroupsUser, apiPutUser, apiDeleteUser, apiPutGroup
} from './apis'
import { setWait, resetWait, setPage, backPage } from './view'
import { syncGroups } from './groups'
import { showError } from './error'
import { findOneById, isEditedUser, getOriginalUser } from '../helper'

export const setUser = (user) => ({
  type: A.SET_USER,
  user,
})

export const removeUser = (uid) => ({
  type: A.DELETE_USER,
  uid,
})

export const setUsers = (users) => ({
  type: A.SET_USERS,
  users,
})

export const resetUsers = () => ({
  type: A.RESET_USERS,
})

export const setFormUser = (user) => ({
  type: A.SET_FORM_USER,
  user,
})

export const updateFormUser = (key, value) => ({
  type: A.UPDATE_FORM_USER,
  key,
  value,
})

export const updateFormUserParent = (uid, checked) => ({
  type: A.UPDATE_FORM_USER_PARENT,
  uid,
  checked,
})

export const addFormUserProfile = (profile) => ({
  type: A.ADD_FORM_USER_PROFILE,
  profile,
})

export const updateFormUserProfileField = (index, key, v) => ({
  type: A.UPDATE_FORM_USER_PROFILE_FIELD,
  index,
  key,
  v,
})

export const updateFormUserProfilePriv = (index, key, p) => ({
  type: A.UPDATE_FORM_USER_PROFILE_PRIV,
  index,
  key,
  p,
})

export const deleteFormUserProfile = (index) => ({
  type: A.DELETE_FORM_USER_PROFILE,
  index,
})

export const resetFormUser = () => ({
  type: A.RESET_FORM_USER,
})

export const editNewUser = gid => async (dispatch, getState) => {
  dispatch(setWait())
  await syncGroups(dispatch)
  let parent = findOneById(getState().groups, gid)
  if (parent) {
    dispatch(setFormUser({ parent, name: '', desc: '' }))
    dispatch(setPage(PAGE.FORM_USER, null))
  } else {
    showError(dispatch, [{ path: 'gid', req: ERR.REFERENCE }])
  }
  dispatch(resetWait())
}

export const editUser = uid => async (dispatch, getState) => {
  dispatch(setWait())
  await syncGroups(dispatch)
  let user = getOriginalUser(getState().users, getState().groups, uid)
  if (user._id) {
    dispatch(setFormUser(user))
    dispatch(setPage(PAGE.FORM_USER, user._id))
  } else {
    showError(dispatch, [{ path: 'uid', req: ERR.REFERENCE }])
  }
  dispatch(resetWait())
}

export const commitEditedUser = async (dispatch, getState) => {
  dispatch(setWait())
  let edited = getState().editedUser
  edited.parent
    ? commitAddUser(dispatch, getState, edited)
    : commitUpdateUser(dispatch, getState, getOriginalUser(getState().users, getState().groups, edited._id), edited)
  dispatch(resetWait())
}

export const commitAddUser = async (dispatch, getState, edited) => {
  let res = await apiPostGroupsUser(edited.parent._id, edited)
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    await syncGroups(dispatch)
    dispatch(setUser(res))
    dispatch(setPage(PAGE.USER, res._id))
  }
}

export const commitUpdateUser = async (dispatch, getState, user, edited) => {
  if (isEditedUser(user, edited)) {
    let res = await apiPutUser(edited)
    if (res.errors) {
      showError(dispatch, res.errors)
      return
    } else {
      dispatch(setUser(res))
    }
  }
  await Promise.all(
    edited.parents.filter(gid => 0 > user.parents.indexOf(gid))
    .map(gid => {
      let parent = findOneById(getState().groups, gid, {})
      return apiPutGroup({ ...parent, uids: parent.uids.concat(edited._id) })
    })
  )
  await Promise.all(
    user.parents.filter(gid => 0 > edited.parents.indexOf(gid))
    .map(gid => {
      let parent = findOneById(getState().groups, gid, {})
      return apiPutGroup({ ...parent, uids: parent.uids.filter(uid => uid !== edited._id) })
    })
  )
  await syncGroups(dispatch)
  dispatch(backPage())
}

export const cancelEditUser = dispatch => {
  dispatch(resetFormUser())
  dispatch(backPage(true))
}

export const commitRemoveUser = async (dispatch, getState) => {
  dispatch(setWait())
  let user = getState().editedUser
  let res = await apiDeleteUser(user)
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    await syncGroups(dispatch)
    dispatch(removeUser(user._id))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}
