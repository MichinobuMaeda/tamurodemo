/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {API_BASE_PATH} from '../preferences'
import {METHOD} from '../constants'

const credentials = 'same-origin'
const headers = {'Content-Type': 'application/json'}

// priv  : PRIV.GUEST
export const getTop = () => fetch(
  `${API_BASE_PATH}/`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const getGroups = () => fetch(
  `${API_BASE_PATH}/groups`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MEMBER
export const getGroup = gid => fetch(
  `${API_BASE_PATH}/groups/${gid}`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.OWNER
export const updateGroup = ({_id, ver, ...body}) => fetch(
  `${API_BASE_PATH}/groups/${_id}/ver/${ver}`, {
    method: METHOD.PUT,
    body: JSON.stringify(body),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const deleteGroup = ({_id, ver}) => fetch(
  `${API_BASE_PATH}/groups/${_id}/ver/${ver}`, {
    method: METHOD.DELETE,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const createSubGroup = (gid, group) => fetch(
  `${API_BASE_PATH}/groups/${gid}/subgroups`, {
    method: METHOD.POST,
    body: JSON.stringify(group),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const createMember = (gid, user) => fetch(
  `${API_BASE_PATH}/groups/${gid}/users`, {
    method: METHOD.POST,
    body: JSON.stringify(user),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const setGroupGroups = ({_id, groups}) => fetch(
  `${API_BASE_PATH}/groups/${_id}/groups`, {
    method: METHOD.PUT,
    body: JSON.stringify({gids: groups.map(g => g._id)}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.OWNER
export const setSubGroups = ({_id, subGroups}) => fetch(
  `${API_BASE_PATH}/groups/${_id}/subgroups`, {
    method: METHOD.PUT,
    body: JSON.stringify({sids: subGroups.map(g => g._id)}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.OWNER
export const setMembers = ({_id, users}) => fetch(
  `${API_BASE_PATH}/groups/${_id}/users`, {
    method: METHOD.PUT,
    body: JSON.stringify({uids: users.map(g => g._id)}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.OWNER
export const setOwners = ({_id, owners}) => fetch(
  `${API_BASE_PATH}/groups/${_id}/owners`, {
    method: METHOD.PUT,
    body: JSON.stringify({oids: owners.map(g => g._id)}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const getUsers = () => fetch(
  `${API_BASE_PATH}/users`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const getInvitees = () => fetch(
  `${API_BASE_PATH}/invitees`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MEMBER
export const getUser = uid => fetch(
  `${API_BASE_PATH}/users/${uid}`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.USER
export const updateUser = ({_id, ver, ...body}) => fetch(
  `${API_BASE_PATH}/users/${_id}/ver/${ver}`, {
    method: METHOD.PUT,
    body: JSON.stringify(body),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const deleteUser = ({_id, ver}) => fetch(
  `${API_BASE_PATH}/users/${_id}/ver/${ver}`, {
    method: METHOD.DELETE,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER
export const setUserGroups = ({_id, groups}) => fetch(
  `${API_BASE_PATH}/users/${_id}/groups`, {
    method: METHOD.PUT,
    body: JSON.stringify({gids: groups.map(g => g._id)}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.USER
export const getUserCerts = uid => fetch(
  `${API_BASE_PATH}/users/${uid}/certs`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.USER
export const createUserCert = ({uid, provider, id, password, token}) => fetch(
  `${API_BASE_PATH}/users/${uid}/certs`, {
    method: METHOD.POST,
    body: JSON.stringify({provider, id, password, token}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.USER
export const updateUserCert = ({uid, provider, ver, id, password, token}) => fetch(
  `${API_BASE_PATH}/users/${uid}/certs/${provider}/ver/${ver}`, {
    method: METHOD.PUT,
    body: JSON.stringify({id, password, token}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.USER
export const deleteUserCert = (uid, {provider, ver}) => fetch(
  `${API_BASE_PATH}/users/${uid}/certs/${provider}/ver/${ver}`, {
    method: METHOD.DELETE,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const getSessions = ({from, to}) => fetch(
  `${API_BASE_PATH}/sessions/${from}/to/${to}`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.GUEST
export const createSession = ({provider, id, password, token}) => fetch(
  `${API_BASE_PATH}/sessions`, {
    method: METHOD.POST,
    body: JSON.stringify({provider, id, password, token}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const deleteSession = sid => fetch(
  `${API_BASE_PATH}/sessions/${sid}`, {
    method: METHOD.DELETE,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MEMBER
export const deleteMySession = () => fetch(
  `${API_BASE_PATH}/sessions/me`, {
    method: METHOD.DELETE,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.MANAGER,
export const revokeManager = () => fetch(
  `${API_BASE_PATH}/sessions/me/revoke/manager`, {
    method: METHOD.PUT,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN,
export const revokeAdmin = () => fetch(
  `${API_BASE_PATH}/sessions/me/revoke/admin`, {
    method: METHOD.PUT,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const createToken = ({uid}) => fetch(
  `${API_BASE_PATH}/token`, {
    method: METHOD.POST,
    body: JSON.stringify({uid}),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const getLogs = ({from, to}) => fetch(
  `${API_BASE_PATH}/logs/${from}/to/${to}`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.GUEST
export const getHelps = () => fetch(
  `${API_BASE_PATH}/helps`, {
    method: METHOD.GET,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const updateHelp = ({pid, ver, ...body}) => fetch(
  `${API_BASE_PATH}/helps/${pid}/ver/${ver}`, {
    method: METHOD.PUT,
    body: JSON.stringify(body),
    headers,
    credentials,
  }
).then(res => res.json())

// priv  : PRIV.ADMIN
export const updateTitle = ({ver, ...body}) => fetch(
  `${API_BASE_PATH}/title/ver/${ver}`, {
    method: METHOD.PUT,
    body: JSON.stringify(body),
    headers,
    credentials,
  }
).then(res => res.json())
