/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PAGE, PROVIDER, NEW_USER_ID} from '../constants'
import {STR} from '../preferences'
import {
  getGroup, setOwners, setMembers, deleteUserCert,
  getUsers, getUser, deleteUser, createMember, updateUser,
  createUserCert, updateUserCert, deleteMySession
} from './api'
import {setEditMode, resetContent} from './status'
import {setPage, backPage, currentPage} from './pages'
import {CONFIRM_ACTION, setConfirmation} from './confirmation'
import {gotoErrorPage} from './errors'
import {
  addGroupListOwner, addGroupListMember,
  removeGroupListOwner, removeGroupListMember,
  setGroupListOwner, setGroupListMember,
  gotoGroup, selectGroup,
} from './groups'

export const setUsers = users => ({
  type: A.SET_USERS,
  users,
})

export const setUser = user => ({
  type: A.SET_USER,
  user,
})

export const setUserName = (uid, name) => ({
  type: A.SET_USER_NAME,
  uid,
  name,
})

export const setUserDesc = (uid, desc) => ({
  type: A.SET_USER_DESC,
  uid,
  desc,
})

export const setUserListGroup = (uid, groups) => ({
  type: A.SET_USER_LIST_GROUP,
  uid,
  groups,
})

export const addUserListGroup = (uid, group) => ({
  type: A.ADD_USER_LIST_GROUP,
  uid,
  group,
})

export const removeUserListGroup = (uid, group) => ({
  type: A.REMOVE_USER_LIST_GROUP,
  uid,
  group,
})

export const removeUser = uid => ({
  type: A.REMOVE_USER,
  uid,
})

export const resetUsers = () => ({
  type: A.RESET_USERS,
})

export const setCertId = (uid, id) => ({
  type: A.SET_CERT_ID,
  uid,
  id,
})

export const setCertPassword = (uid, password) => ({
  type: A.SET_CERT_PASSWORD,
  uid,
  password,
})

export const setCertConfirm = (uid, confirm) => ({
  type: A.SET_CERT_CONFIRM,
  uid,
  confirm,
})

export const selectUser = (users, uid) => users.reduce(
  (ret, cur) => cur._id === uid ? cur : ret, {}
)

export const selectCert = (certs, provider, initial={}) =>
  certs.reduce((ret, cur) => cur.provider === provider ? cur : ret, initial)

export const gotoUser = uid => async dispatch => {
  const res = await getUser(uid)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setUser(res))
    dispatch(setPage(PAGE.USER, uid))
  }
}

export const editNewUser = group => dispatch => {
  dispatch(setUser({
    _id: NEW_USER_ID,
    name: '',
    desc: '',
    profiles: [],
    groups: [group],
    ownedGroups: [],
    signin: [],
  }))
  dispatch(setPage(PAGE.USER_EDITOR, NEW_USER_ID))
}

export const commitEditedUser = uid => async (dispatch, getState) => {
  const user = selectUser(getState().users, uid)
  const res = uid === NEW_USER_ID
    ? await createMember(user.groups[0]._id, user)
    : await updateUser(user)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setEditMode(false))
    dispatch(backPage(true))
    if (uid === NEW_USER_ID) {
      dispatch(removeUser(NEW_USER_ID))
      await dispatch(gotoGroup(user.groups[0]._id))
    } else {
      dispatch(setUser(res))
      dispatch(setPage(PAGE.USER, res._id))
    }
  }
}

export const discardEditedUser = uid => async (dispatch, getState) => {
  dispatch(setEditMode(false))
  const user = selectUser(getState().users, uid)
  dispatch(backPage(true))
  if (uid === NEW_USER_ID) {
    dispatch(removeUser(NEW_USER_ID))
  } else if (user.edited) {
    await dispatch(gotoUser(uid))
  }
}

export const gotoUserListEditor = (page) => async dispatch => {
  dispatch(setUsers(await getUsers()))
  dispatch(setPage(page.name, page.id))
}

export const toggleUserList = (page, user, checked) => dispatch => {
  switch (page.name) {
  case PAGE.GROUP_EDITOR_OWNER:
    checked
      ? dispatch(addGroupListOwner(page.id, user))
      : dispatch(removeGroupListOwner(page.id, user))
    break
  case PAGE.GROUP_EDITOR_MEMBER:
    checked
      ? dispatch(addGroupListMember(page.id, user))
      : dispatch(removeGroupListMember(page.id, user))
    break
  default:
    break
  }
}

export const commitUserList = page => async (dispatch, getState) => {
  const group = selectGroup(getState().groups, page.id)
  switch (page.name) {
  case PAGE.GROUP_EDITOR_OWNER: {
    const res = await setOwners(group)
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setGroupListOwner(page.id, res.owners))
      await dispatch(resetContent())
      await dispatch(gotoGroup(page.id))
    }
    break
  }
  case PAGE.GROUP_EDITOR_MEMBER: {
    const res = await setMembers(group)
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(setGroupListMember(page.id, res.users))
      await dispatch(resetContent())
      await dispatch(gotoGroup(page.id))
    }
    break
  }
  default:
    break
  }
}

export const discardUserList = page => async dispatch => {
  dispatch(setEditMode(false))
  const res = await getGroup(page.id)
  if (res.errors) {
    dispatch(backPage(true))
    dispatch(gotoErrorPage(res.errors))
  } else {
    switch (page.name) {
    case PAGE.GROUP_EDITOR_OWNER: {
      dispatch(setGroupListOwner(page.id, res.owners))
      break
    }
    case PAGE.GROUP_EDITOR_MEMBER: {
      dispatch(setGroupListMember(page.id, res.users))
      break
    }
    default:
      break
    }
    dispatch(backPage(true))
  }
}

export const confirmDeleteUser = uid => (dispatch, getState) => {
  const {users} = getState()
  const user = selectUser(users, uid)
  dispatch(setConfirmation({
    open: true,
    title: user.name,
    message: STR.CONFIRM_DELETE,
    action: CONFIRM_ACTION.DELETE_USER,
    id: uid,
  }))
}

export const commitDeleteUser = uid => async (dispatch, getState) => {
  const {status, users} = getState()
  const user = selectUser(users, uid)
  dispatch(setConfirmation({}))
  dispatch(setEditMode(false))
  const res = await deleteUser(user)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    await dispatch(resetContent())
    await dispatch(gotoGroup(status.top._id))
  }
}

export const setProviderPassword = uid => async (dispatch, getState) => {
  const {users, pages} = getState()
  const user = users.reduce((ret, cur) => cur._id === uid ? cur : ret, null)
  let cert = selectCert(user.certs, PROVIDER.PASSWORD, null)
  let res = cert.ver
    ? await updateUserCert({...cert, uid})
    : await createUserCert({...cert, uid})
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else if (currentPage(pages).name === PAGE.WELCOME) {
    await deleteMySession()
    await dispatch(resetContent())
  } else {
    let res = await getUser(uid)
    if (res.errors) {
      dispatch(gotoErrorPage(res.errors))
    } else {
      dispatch(gotoUser(uid))
    }
  }
}

export const gotoSignInMethod = uid => async dispatch => {
  const res = await getUser(uid)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(setUser(res))
    dispatch(setPage(PAGE.USER_CERT_EDITOR, uid))
  }
}

export const confirmDeletePassword = uid => (dispatch, getState) => {
  const {users} = getState()
  const user = selectUser(users, uid)
  dispatch(setConfirmation({
    open: true,
    title: user.name,
    message: STR.CONFIRM_DELETE_PASSWORD,
    action: CONFIRM_ACTION.DELETE_PASSWORD,
    id: uid,
  }))
}

export const commitDeletePassword = uid => async (dispatch, getState) => {
  const {users} = getState()
  const user = selectUser(users, uid)
  const cert = selectCert(user.certs, PROVIDER.PASSWORD)
  dispatch(setConfirmation({}))
  dispatch(setEditMode(false))
  const res = await deleteUserCert(uid, cert)
  if (res.errors) {
    dispatch(gotoErrorPage(res.errors))
  } else {
    dispatch(gotoUser(uid))
  }
}

export const discardEditedUserCert = uid => async dispatch => {
  dispatch(backPage(true))
  await dispatch(gotoUser(uid))
}
