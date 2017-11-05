/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A, PROVIDER} from '../constants'

const users = (state = [], action) => {
  switch (action.type) {
  case A.SET_USERS:
    return action.users.map(
      u => state.reduce((ret, cur) => cur._id === u._id
        ? {
          ...cur,
          name: u.name,
        }
        : ret,
      u)
    )
  case A.SET_USER:
    return [
      ...state.filter(u => u._id !== action.user._id),
      {...action.user},
    ]
  case A.SET_USER_NAME:
    return state.map(u => u._id === action.uid
      ? {
        ...u,
        name: action.name,
        edited: true,
      }
      : u
    )
  case A.SET_USER_DESC:
    return state.map(u => u._id === action.uid
      ? {
        ...u,
        desc: action.desc,
        edited: true,
      }
      : u
    )
  case A.SET_USER_LIST_GROUP:
    return state.map(u => u._id === action.uid
      ? {
        ...u,
        groups: [...action.groups],
        editedGroups: false,
      }
      : u
    )
  case A.ADD_USER_LIST_GROUP:
    return state.map(u => u._id === action.uid
      ? {
        ...u,
        groups: u.groups.concat(action.group),
        editedGroups: true,
      }
      : u
    )
  case A.REMOVE_USER_LIST_GROUP:
    return state.map(u => u._id === action.uid
      ? {
        ...u,
        groups: u.groups.filter(t => t._id !== action.group._id),
        editedGroups: true,
      }
      : u
    )
  case A.REMOVE_USER:
    return [
      ...state.filter(u => u._id !== action.uid),
    ]
  case A.RESET_USERS:
    return []
  case A.SET_CERT_ID:
    return [
      ...state.filter(u => u._id !== action.uid),
      ...state.filter(u => u._id === action.uid).map(u => (
        {
          ...u,
          certs: [
            ...u.certs.filter(c => c.provider !== PROVIDER.PASSWORD),
            u.certs.reduce(
              (ret, cur) => cur.provider === PROVIDER.PASSWORD ? {
                ...cur,
                id: action.id,
                edited: true,
              } : ret,
              {
                provider: PROVIDER.PASSWORD,
                id: action.id,
                edited: true,
              }
            ),
          ],
        }
      )),
    ]
  case A.SET_CERT_PASSWORD:
    return [
      ...state.filter(u => u._id !== action.uid),
      ...state.filter(u => u._id === action.uid).map(u => (
        {
          ...u,
          certs: [
            ...u.certs.filter(c => c.provider !== PROVIDER.PASSWORD),
            u.certs.reduce(
              (ret, cur) => cur.provider === PROVIDER.PASSWORD ? {
                ...cur,
                password: action.password,
                edited: true,
              } : ret,
              {
                provider: PROVIDER.PASSWORD,
                password: action.password,
                edited: true,
              }
            ),
          ],
        }
      )),
    ]
  case A.SET_CERT_CONFIRM:
    return [
      ...state.filter(u => u._id !== action.uid),
      ...state.filter(u => u._id === action.uid).map(u => (
        {
          ...u,
          certs: [
            ...u.certs.filter(c => c.provider !== PROVIDER.PASSWORD),
            u.certs.reduce(
              (ret, cur) => cur.provider === PROVIDER.PASSWORD ? {
                ...cur,
                confirm: action.confirm,
                edited: true,
              } : ret,
              {
                provider: PROVIDER.PASSWORD,
                confirm: action.confirm,
                edited: true,
              }
            ),
          ],
        }
      )),
    ]
  default:
    return state
  }
}

export default users
