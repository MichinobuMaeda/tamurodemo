/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A, PAGE, ERR } from '../constants'
import {
  apiGetGroups, apiGetGroupsUsers,
  apiPostGroupsGroup, apiPutGroup, apiDeleteGroup
} from './apis'
import { setWait, resetWait, setPage, backPage } from './view'
import { setTitle } from './auth'
import { setUsers } from './users'
import { showError } from './error'
import { findOneById, isEditedGroup, getOriginalGroup } from '../helper'

export const setGroup = (group) => ({
  type: A.SET_GROUP,
  group,
})

export const setGroups = (groups) => ({
  type: A.SET_GROUPS,
  groups,
})

export const resetGroups = () => ({
  type: A.RESET_GROUPS,
})

export const setFormGroup = (group) => ({
  type: A.SET_FORM_GROUP,
  group,
})

export const updateFormGroup = (key, value) => ({
  type: A.UPDATE_FORM_GROUP,
  key,
  value,
})

export const updateFormGroupParent = (gid, checked) => ({
  type: A.UPDATE_FORM_GROUP_PARENT,
  gid,
  checked,
})

export const resetFormGroup = () => ({
  type: A.RESET_FORM_GROUP,
})

export const syncGroups = async (dispatch) => {
  dispatch(setGroups(await apiGetGroups()))
}

const isUserPopulated = (users, uid) => users.reduce(
  (filled, u) => u._id === uid || filled, false)

const isAllUsersPopulated = (users, uids) => uids.reduce(
  (ret, cur) => isUserPopulated(users, cur) && ret, true)

export const populateGroupUsers = async (dispatch, getState, gid) => {
  let group = getState().groups.reduce((ret, cur) => cur._id === gid ? cur : ret, null)
  if (!isAllUsersPopulated(getState().users, group.uids)) {
    dispatch(setUsers(await apiGetGroupsUsers(gid)))
  }
}

export const showGroup = gid => async (dispatch, getState) => {
  dispatch(setWait())
  await populateGroupUsers(dispatch, getState, gid)
  dispatch(setPage(PAGE.GROUP, gid))
  dispatch(resetWait())
}

export const editNewGroup = gid => async (dispatch, getState) => {
  dispatch(setWait())
  await syncGroups(dispatch)
  gid = gid || getState().prim.top
  let parent = findOneById(getState().groups, gid)
  if (parent) {
    dispatch(setFormGroup({ parent, name: '', desc: '' }))
    dispatch(setPage(PAGE.FORM_GROUP, null))
  } else {
    showError(dispatch, [{ path: 'gid', req: ERR.REFERENCE }])
  }
  dispatch(resetWait())
}

export const editGroup = gid => async (dispatch, getState) => {
  dispatch(setWait())
  await syncGroups(dispatch)
  gid = gid || getState().prim.top
  let group = getOriginalGroup(getState().groups, gid)
  if (group._id) {
    dispatch(setFormGroup(group))
    dispatch(setPage(PAGE.FORM_GROUP, group._id))
  } else {
    showError(dispatch, [{ path: 'gid', req: ERR.REFERENCE }])
  }
  dispatch(resetWait())
}

export const commitEditedGroup = async (dispatch, getState) => {
  dispatch(setWait())
  let edited = getState().editedGroup
  edited.parent
    ? commitAddGroup(dispatch, edited)
    : commitUpdateGroup(dispatch, getState, getOriginalGroup(getState().groups, edited._id), edited)
  dispatch(resetWait())
}

export const commitAddGroup = async (dispatch, edited) => {
  let res = await apiPostGroupsGroup(edited.parent._id, edited)
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    await syncGroups(dispatch)
    dispatch(setPage(PAGE.GROUP, res._id))
  }
}

export const commitUpdateGroup = async (dispatch, getState, group, edited) => {
  if (isEditedGroup(group, edited)) {
    let res = await apiPutGroup(edited)
    if (res.errors) {
      showError(dispatch, res.errors)
      return
    }
  }
  await Promise.all(
    edited.parents.filter(gid => 0 > group.parents.indexOf(gid))
    .map(gid => {
      let parent = findOneById(getState().groups, gid, {})
      return apiPutGroup({ ...parent, gids: parent.gids.concat(edited._id) })
    })
  )
  await Promise.all(
    group.parents.filter(gid => 0 > edited.parents.indexOf(gid))
    .map(gid => {
      let parent = findOneById(getState().groups, gid, {})
      return apiPutGroup({ ...parent, gids: parent.gids.filter(gid => gid !== edited._id) })
    })
  )
  await syncGroups(dispatch)
  if (edited._id === getState().prim.top) {
    dispatch(setTitle(edited.name))
  }
  dispatch(backPage())
}
  
export const cancelEditGroup = dispatch => {
  dispatch(resetFormGroup())
  dispatch(backPage(true))
}

export const commitRemoveGroup = async (dispatch, getState) => {
  dispatch(setWait())
  let res = apiDeleteGroup(getState().editedGroup)
  if (res.errors) {
    showError(dispatch, res.errors)
  } else {
    await syncGroups(dispatch)
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}
