/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import Scroll from 'react-scroll'

import { A, PROVIDER, PAGE } from '../constants'

const scroll = Scroll.animateScroll

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

export const setCred = (cred) => ({
  type: A.SET_CRED,
  cred,
})

export const setCredAuthId = (authId) => ({
  type: A.SET_CRED_AUTH_ID,
  authId,
})

export const setCredPassword = (password) => ({
  type: A.SET_CRED_PASSWORD,
  password,
})

export const resetCred = (provider) => ({
  type: A.RESET_CRED,
  provider,
})

export const setCreds = (creds) => ({
  type: A.SET_CREDS,
  creds,
})

export const resetCreds = () => ({
  type: A.RESET_CREDS,
})

export const setLogs = (logs) => ({
  type: A.SET_LOGS,
  logs,
})

export const resetLogs = () => ({
  type: A.RESET_LOGS,
})

export const setSessions = (sessions) => ({
  type: A.SET_SESSIONS,
  sessions,
})

export const resetSessions = () => ({
  type: A.RESET_SESSIONS,
})

export const openDialog = (dialog) => ({
  type: A.OPEN_DIALOG,
  dialog,
})

export const closeDialog = () => ({
  type: A.CLOSE_DIALOG,
})

export const showError = (dispatch, error) => {
  dispatch(setError(error))
  dispatch(setPage(PAGE.ERROR))
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
    dispatch(resetGroups())
    dispatch(resetUsers())
    dispatch(resetLogs())
  }
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
  let res = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(getState().auth),
      provider: PROVIDER.PASSWORD,
    }),
    credentials: 'same-origin',
  })
  let json = await res.json()
  setStatus(dispatch, json)
  dispatch(resetWait())
}

export const doSingInWithGoogle = (googleUser) => async (dispatch, getState) => {
  dispatch(setWait())
  let res = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: PROVIDER.GOOGLE,
      authId: googleUser.getAuthResponse().id_token,
    }),
    credentials: 'same-origin',
  })
  let json = await res.json()
  setStatus(dispatch, json)
  dispatch(resetWait())
}

export const failureSingInWithGoogle = () => async (dispatch) => {
  setStatus(dispatch, { errors: [ { path: 'oauth2', req: PROVIDER.GOOGLE } ] })
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
  dispatch(setPage(PAGE.GROUP, gid))
  dispatch(resetWait())
}

export const showProviders = uid => async (dispatch, getState) => {
  dispatch(setWait())
  let res = await fetch(`/api/users/${uid}/providers`, {
    credentials: 'same-origin',
  })
  let json = await res.json()
  dispatch(setCreds(json))
  dispatch(setPage(PAGE.CREDENTIAL, uid))
  dispatch(resetWait())
}

export const committedAuthIdPassword = async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, null)
  let res = cred._id
    ? await fetch(`/api/users/${cred.uid}/providers/${PROVIDER.PASSWORD}/ver/${cred.ver}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred),
        credentials: 'same-origin',
      })
    : await fetch(`/api/users/${getState().sess.uid}/providers/${PROVIDER.PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...cred, uid: getState().sess.uid }),
        credentials: 'same-origin',
      })
  let json = await res.json()
  if (json.errors) {
    showError(dispatch, json.errors)
  } else {
    dispatch(setCred(json))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}

export const disabledPassword = async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.PASSWORD ? cur : ret, null)
  let res = await fetch(`/api/users/${cred.uid}/providers/${cred.provider}/ver/${cred.ver}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  })
  let json = await res.json()
  if (json.errors) {
    showError(dispatch, json.errors)
  } else {
    dispatch(resetCred(PROVIDER.PASSWORD))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}

export const connectGoogle = (googleUser) => async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.GOOGLE ? cur : ret, null)
  cred = cred
    ? {
        ...cred,
        authId: googleUser.getAuthResponse().id_token,
      }
    : {
        provider: PROVIDER.GOOGLE,
        authId: googleUser.getAuthResponse().id_token,
      }
  let res = cred._id
    ? await fetch(`/api/users/${cred.uid}/providers/${PROVIDER.GOOGLE}/ver/${cred.ver}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred),
        credentials: 'same-origin',
      })
    : await fetch(`/api/users/${getState().sess.uid}/providers/${PROVIDER.GOOGLE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...cred, uid: getState().sess.uid }),
        credentials: 'same-origin',
      })
  let json = await res.json()
  if (json.errors) {
    showError(dispatch, json.errors)
  } else {
    dispatch(setCred(json))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}

export const disconnectGoogle = async (dispatch, getState) => {
  dispatch(setWait())
  let cred = getState().creds.reduce((ret, cur) => cur.provider === PROVIDER.GOOGLE ? cur : ret, null)
  let res = await fetch(`/api/users/${cred.uid}/providers/${PROVIDER.GOOGLE}/ver/${cred.ver}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  })
  let json = await res.json()
  if (json.errors) {
    showError(dispatch, json.errors)
  } else {
    dispatch(resetCred(PROVIDER.GOOGLE))
    dispatch(setPage(PAGE.TOP))
  }
  dispatch(resetWait())
}

export const showLogs = async (dispatch) => {
  const time = new Date().getTime()
  dispatch(setWait())
  let res = await fetch(`/api/logs/${time - 60 * 60 * 1000}/to/${time}`, {
    credentials: 'same-origin',
  })
  let json = await res.json()
  dispatch(setLogs(json))
  dispatch(setPage(PAGE.LOGS))
  dispatch(resetWait())
}

export const getMoreLogs = async (dispatch, getState) => {
  const time = getState().logs.f + 1000
  dispatch(setWait())
  let res = await fetch(`/api/logs/${time - 60 * 61 * 1000}/to/${time}`, {
    credentials: 'same-origin',
  })
  let json = await res.json()
  dispatch(setLogs(json))
  dispatch(setPage(PAGE.LOGS))
  dispatch(resetWait())
  scroll.scrollToBottom({
    duration: 0,
    delay: 0,
    smooth: false,
  })
}

export const showSessions = async (dispatch) => {
  dispatch(setWait())
  let res = await fetch(`/api/sessions`, {
    credentials: 'same-origin',
  })
  let json = await res.json()
  dispatch(setSessions(json))
  dispatch(setPage(PAGE.SESSIONS))
  dispatch(resetWait())
}
