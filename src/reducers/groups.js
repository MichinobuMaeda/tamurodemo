/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'

const groups = (state = [], action) => {
  switch (action.type) {
  case A.SET_GROUPS:
    return action.groups.map(
      g => state.reduce((ret, cur) => cur._id === g._id
        ? {
          ...cur,
          name: g.name,
          role: g.role,
        }
        : ret,
      g)
    )
  case A.SET_GROUP:
    return [
      ...state.filter(g => g._id !== action.group._id),
      {...action.group},
    ]
  case A.SET_GROUP_NAME:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        name: action.name,
        edited: true,
      }
      : g)
  case A.SET_GROUP_DESC:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        desc: action.desc,
        edited: true,
      }
      : g
    )
  case A.SET_GROUP_LIST_GROUP:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        groups: [...action.groups],
        editedGroups: false,
      }
      : g
    )
  case A.SET_GROUP_LIST_SUBGROUP:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        subGroups: [...action.groups],
        editedSubGroups: false,
      }
      : g
    )
  case A.SET_GROUP_LIST_OWNER:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        owners: [...action.users],
        editedOwners: false,
      }
      : g
    )
  case A.SET_GROUP_LIST_MEMBER:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        users: [...action.users],
        editedUsers: false,
      }
      : g
    )
  case A.ADD_GROUP_LIST_GROUP:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        groups: g.groups.concat(action.group),
        editedGroups: true,
      }
      : g
    )
  case A.ADD_GROUP_LIST_SUBGROUP:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        subGroups: g.subGroups.concat(action.group),
        editedSubGroups: true,
      }
      : g
    )
  case A.ADD_GROUP_LIST_OWNER:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        owners: g.owners.concat(action.user),
        editedOwners: true,
      }
      : g
    )
  case A.ADD_GROUP_LIST_MEMBER:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        users: g.users.concat(action.user),
        editedUsers: true,
      }
      : g
    )
  case A.REMOVE_GROUP_LIST_GROUP:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        groups: g.groups.filter(t => t._id !== action.group._id),
        editedGroups: true,
      }
      : g
    )
  case A.REMOVE_GROUP_LIST_SUBGROUP:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        subGroups: g.subGroups.filter(t => t._id !== action.group._id),
        editedSubGroups: true,
      }
      : g
    )
  case A.REMOVE_GROUP_LIST_OWNER:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        owners: g.owners.filter(t => t._id !== action.user._id),
        editedOwners: true,
      }
      : g
    )
  case A.REMOVE_GROUP_LIST_MEMBER:
    return state.map(g => g._id === action.gid
      ? {
        ...g,
        users: g.users.filter(t => t._id !== action.user._id),
        editedUsers: true,
      }
      : g
    )
  case A.REMOVE_GROUP:
    return [
      ...state.filter(g => g._id !== action.gid),
    ]
  case A.RESET_GROUPS:
    return []
  default:
    return state
  }
}

export default groups
