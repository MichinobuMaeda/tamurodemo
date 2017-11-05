/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE, GROUP_ROLE, NEW_GROUP_ID} from '../constants'
import {STR} from '../preferences'
import {
  getGroups, getGroup, updateGroup, getUser,
  setGroupGroups, setSubGroups, setUserGroups,
  createSubGroup, deleteGroup
} from './api'
import {setEditMode, resetContent} from './status'
import {setPage, backPage} from './pages'
import {CONFIRM_ACTION, setConfirmation} from './confirmation'
import {gotoErrorPage} from './errors'
import {
  setUserListGroup, addUserListGroup, removeUserListGroup, selectUser
} from './users'

export const setGroups = groups => ({
  type: A.SET_GROUPS,
  groups,
})

export const setGroup = group => ({
  type: A.SET_GROUP,
  group,
})

export const setGroupName = (gid, name) => ({
  type: A.SET_GROUP_NAME,
  gid,
  name,
})

export const setGroupDesc = (gid, desc) => ({
  type: A.SET_GROUP_DESC,
  gid,
  desc,
})

export const setGroupListGroup = (gid, groups) => ({
  type: A.SET_GROUP_LIST_GROUP,
  gid,
  groups,
})

export const setGroupListSubGroup = (gid, groups) => ({
  type: A.SET_GROUP_LIST_SUBGROUP,
  gid,
  groups,
})

export const setGroupListOwner = (gid, users) => ({
  type: A.SET_GROUP_LIST_OWNER,
  gid,
  users,
})

export const setGroupListMember = (gid, users) => ({
  type: A.SET_GROUP_LIST_MEMBER,
  gid,
  users,
})

export const addGroupListGroup = (gid, group) => ({
  type: A.ADD_GROUP_LIST_GROUP,
  gid,
  group,
})

export const addGroupListSubGroup = (gid, group) => ({
  type: A.ADD_GROUP_LIST_SUBGROUP,
  gid,
  group,
})

export const addGroupListOwner = (gid, user) => ({
  type: A.ADD_GROUP_LIST_OWNER,
  gid,
  user,
})

export const addGroupListMember = (gid, user) => ({
  type: A.ADD_GROUP_LIST_MEMBER,
  gid,
  user,
})

export const removeGroupListGroup = (gid, group) => ({
  type: A.REMOVE_GROUP_LIST_GROUP,
  gid,
  group,
})

export const removeGroupListSubGroup = (gid, group) => ({
  type: A.REMOVE_GROUP_LIST_SUBGROUP,
  gid,
  group,
})

export const removeGroupListOwner = (gid, user) => ({
  type: A.REMOVE_GROUP_LIST_OWNER,
  gid,
  user,
})

export const removeGroupListMember = (gid, user) => ({
  type: A.REMOVE_GROUP_LIST_MEMBER,
  gid,
  user,
})

export const removeGroup = gid => ({
  type: A.REMOVE_GROUP,
  gid,
})

export const resetGroups = () => ({
  type: A.RESET_GROUPS,
})

export const selectGroup = (groups, gid) => groups.reduce(
  (ret, cur) => cur._id === gid ? cur : ret, {}
)

export const gotoGroup = gid => async dispatch => {
  const res = await getGroup(gid)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setGroup(res))
    dispatch(setPage(PAGE.GROUP, gid))
  }
}

export const editNewGroup = group => dispatch => {
  dispatch(setGroup({
    _id: NEW_GROUP_ID,
    name: '',
    desc: '',
    groups: [group],
    subGroups: [],
    owners: [],
    users: [],
  }))
  dispatch(setPage(PAGE.GROUP_EDITOR, NEW_GROUP_ID))
}

export const commitEditedGroup = gid => async (dispatch, getState) => {
  const group = selectGroup(getState().groups, gid)
  const res = gid === NEW_GROUP_ID
    ? await createSubGroup(group.groups[0]._id, group)
    : await updateGroup(group)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setEditMode(false))
    dispatch(backPage(true))
    if (gid === NEW_GROUP_ID) {
      dispatch(removeGroup(NEW_GROUP_ID))
      await dispatch(gotoGroup(group.groups[0]._id))
    } else {
      dispatch(setGroup(res))
      dispatch(setPage(PAGE.GROUP, res._id))
    }
  }
}

export const discardEditedGroup = gid => async (dispatch, getState) => {
  dispatch(setEditMode(false))
  const group = selectGroup(getState().groups, gid)
  dispatch(backPage(true))
  if (gid === NEW_GROUP_ID) {
    dispatch(removeGroup(NEW_GROUP_ID))
  } else if (group.edited) {
    await dispatch(gotoGroup(gid))
  }
}

export const gotoGroupListEditor = (page) => async dispatch => {
  dispatch(setGroups(await getGroups()))
  dispatch(setPage(page.name, page.id))
}

export const toggleGroupList = (page, group, checked) => dispatch => {
  switch (page.name) {
  case PAGE.GROUP_EDITOR_GROUP:
    checked
      ? dispatch(addGroupListGroup(page.id, group))
      : dispatch(removeGroupListGroup(page.id, group))
    break
  case PAGE.GROUP_EDITOR_SUBGROUP:
    checked
      ? dispatch(addGroupListSubGroup(page.id, group))
      : dispatch(removeGroupListSubGroup(page.id, group))
    break
  case PAGE.USER_EDITOR_GROUP:
    checked
      ? dispatch(addUserListGroup(page.id, group))
      : dispatch(removeUserListGroup(page.id, group))
    break
  default:
    break
  }
}

export const commitGroupList = page => async (dispatch, getState) => {
  switch (page.name) {
  case PAGE.GROUP_EDITOR_GROUP: {
    const res = await setGroupGroups(selectGroup(getState().groups, page.id))
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setEditMode(false))
      await dispatch(resetContent())
      await dispatch(gotoGroup(page.id))
    }
    break
  }
  case PAGE.GROUP_EDITOR_SUBGROUP: {
    const res = await setSubGroups(selectGroup(getState().groups, page.id))
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setEditMode(false))
      await dispatch(resetContent())
      await dispatch(gotoGroup(page.id))
    }
    break
  }
  case PAGE.USER_EDITOR_GROUP: {
    const res = await setUserGroups(selectUser(getState().users, page.id))
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setEditMode(false))
      await dispatch(resetContent())
      await dispatch(gotoGroup(page.id))
    }
    break
  }
  default:
    break
  }
}

export const discardGroupList = page => async dispatch => {
  dispatch(setEditMode(false))
  switch (page.name) {
  case PAGE.GROUP_EDITOR_GROUP: {
    const res = await getGroup(page.id)
    if (res.errors) {
      dispatch(backPage(true))
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setGroupListGroup(page.id, res.groups))
      dispatch(backPage(true))
    }
    break
  }
  case PAGE.GROUP_EDITOR_SUBGROUP: {
    const res = await getGroup(page.id)
    if (res.errors) {
      dispatch(backPage(true))
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setGroupListSubGroup(page.id, res.subGroups))
      dispatch(backPage(true))
    }
    break
  }
  case PAGE.USER_EDITOR_GROUP: {
    const res = await getUser(page.id)
    if (res.errors) {
      dispatch(backPage(true))
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setUserListGroup(page.id, res.groups))
      dispatch(backPage(true))
    }
    break
  }
  default:
    break
  }
}

export const confirmDeleteGroup = gid => (dispatch, getState) => {
  const {groups} = getState()
  const group = selectGroup(groups, gid)
  dispatch(setConfirmation({
    open: true,
    title: group.name,
    message: STR.CONFIRM_DELETE,
    action: CONFIRM_ACTION.DELETE_GROUP,
    id: gid,
  }))
}

export const commitDeleteGroup = gid => async (dispatch, getState) => {
  const {status, groups} = getState()
  const group = selectGroup(groups, gid)
  dispatch(setConfirmation({}))
  dispatch(setEditMode(false))
  const res = await deleteGroup(group)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    await dispatch(resetContent())
    await dispatch(gotoGroup(status.top._id))
  }
}

export const groupList = (groups, ignores = []) => [
  ...groups
    .filter(g => g.role === GROUP_ROLE.TOP),
  ...groups
    .filter(g => g.role !== GROUP_ROLE.MANAGER &&
                 g.role !== GROUP_ROLE.ADMIN),
  ...groups
    .filter(g => g.role === GROUP_ROLE.MANAGER),
  ...groups
    .filter(g => g.role === GROUP_ROLE.ADMIN),
].filter(g => 0 > ignores.indexOf(g._id))
