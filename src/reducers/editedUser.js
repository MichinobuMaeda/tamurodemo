/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { A } from '../constants'

const editedUser = (state = {}, action) => {
  switch (action.type) {
    case A.SET_FORM_USER: {
      return {
        ...action.user,
        profiles: [ ...action.user.profiles.map(prof => ({...prof})) ],
      }
    }
    case A.UPDATE_FORM_USER: {
      let ret = {...state}
      ret[action.key] = action.value
      return ret
    }
    case A.UPDATE_FORM_USER_PARENT: {
      return {
        ...state,
        parents: [
          ...(state.parents.filter(uid => uid !== action.uid)),
          ...(action.checked ? [action.uid] : [])
        ].sort()
      }
    }
    case A.ADD_FORM_USER_PROFILE: {
      return {
        ...state,
        profiles: state.profiles.concat(action.profile)
      }
    }
    case A.UPDATE_FORM_USER_PROFILE_FIELD: {
      let ret = {
        ...state,
      }
      let org = ret.profiles[action.index][action.key] || { v: "", p: [] }
      ret.profiles[action.index][action.key] = { ...org, v: (action.v || '') }
      return ret
    }
    case A.UPDATE_FORM_USER_PROFILE_PRIV: {
      let ret = {
        ...state,
      }
      let org = ret.profiles[action.index][action.key] || { v: "", p: [] }
      ret.profiles[action.index][action.key] = { ...org, p: (action.p || []) }
      return ret
    }
    case A.DELETE_FORM_USER_PROFILE: {
      return {
        ...state,
        profiles: state.profiles.filter((p, i) => i !== action.index)
      }
    }
    case A.RESET_FORM_USER: {
      return {}
    }
    default: {
      return state
    }
  }
}

export default editedUser
