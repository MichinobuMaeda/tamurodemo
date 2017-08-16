/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { API_BASE_PATH } from '../preferences'

const credentials = 'same-origin'
const headers = { 'Content-Type': 'application/json' }

export const apiGetStatus = () => fetch(
  `${API_BASE_PATH}/`, {
    credentials,
  }
).then(res => res.json())

export const apiPutUser = user => fetch(
  `${API_BASE_PATH}/groups/${user._id}/ver/${user.ver}`, {
    method: 'PUT',
    body: JSON.stringify(user),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiDeleteUser = user => fetch(
  `${API_BASE_PATH}/groups/${user._id}/ver/${user.ver}`, {
    method: 'DELETE',
    credentials,
  }
).then(res => res.json())

export const apiGetGroups = () => fetch(
  `${API_BASE_PATH}/groups`, {
    credentials,
  }
).then(res => res.json())

export const apiPutGroup = group => fetch(
  `${API_BASE_PATH}/groups/${group._id}/ver/${group.ver}`, {
    method: 'PUT',
    body: JSON.stringify(group),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiDeleteGroup = group => fetch(
  `${API_BASE_PATH}/groups/${group._id}/ver/${group.ver}`, {
    method: 'DELETE',
    credentials,
  }
).then(res => res.json())

export const apiPostGroupsGroup = (gid, group) => fetch(
  `${API_BASE_PATH}/groups/${gid}/groups`, {
    method: 'POST',
    body: JSON.stringify(group),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiGetGroupsUsers = gid => fetch(
  `${API_BASE_PATH}/groups/${gid}/users`, {
    credentials,
  }
).then(res => res.json())

export const apiPostGroupsUser = (gid, user) => fetch(
  `${API_BASE_PATH}/groups/${gid}/users`, {
    method: 'POST',
    body: JSON.stringify(user),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiGetUsersProviders = uid => fetch(
  `${API_BASE_PATH}/users/${uid}/providers`, {
    method: 'GET',
    credentials,
  }
).then(res => res.json())

export const apiPostUsersProvider = cred => fetch(
  `${API_BASE_PATH}/users/${cred.uid}/providers/${cred.provider}/ver/${cred.ver}`, {
    method: 'PUT',
    body: JSON.stringify(cred),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiPutUsersProvider = cred => fetch(
  `${API_BASE_PATH}/users/${cred.uid}/providers/${cred.provider}`, {
    method: 'POST',
    body: JSON.stringify(cred),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiDeleteUsersProvider = cred => fetch(
  `${API_BASE_PATH}/users/${cred.uid}/providers/${cred.provider}/ver/${cred.ver}`, {
    method: 'DELETE',
    credentials,
  }
).then(res => res.json())

export const apiGetSessions = () => fetch(
  `${API_BASE_PATH}/sessions`, {
    method: 'GET',
    credentials,
  }
).then(res => res.json())

export const apiPostSession = authInput => fetch(
  `${API_BASE_PATH}/sessions`, {
    method: 'POST',
    body: JSON.stringify(authInput),
    headers,
    credentials,
  }
).then(res => res.json())

export const apiDeleteSession = () => fetch(
  `${API_BASE_PATH}/sessions`, {
    method: 'DELETE',
    credentials,
  }
).then(res => res.json())

export const apiGetLogs = (from, to) => fetch(
  `${API_BASE_PATH}/logs/${from}/to/${to}`, {
    method: 'GET',
    credentials,
  }
).then(res => res.json())
