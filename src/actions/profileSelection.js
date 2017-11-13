/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {A} from '../constants'
import {profileItems, profileTemplates} from '../preferences'
import {selectUser, setProfile} from './users'

export const setProfileSelection = (open=false, tag=null) => ({
  type: A.SET_PROFILE_SELECTION,
  open,
  tag,
})

export const selectProfileTemplate = (profileTemplates, tag) => profileTemplates.reduce(
  (ret, cur) => cur.tag === tag ? cur : ret, {}
)

export const addTagSuffix = (profiles, tag, i=2) =>
  profiles.filter(p => p.tag === `${tag} ${i}`).length
    ? addTagSuffix(profiles, tag, ++i)
    : `${tag} ${i}`

export const addProfile = (uid, selected) => (dispatch, getState) => {
  dispatch(setProfileSelection(false))
  const profileTemplate = selectProfileTemplate(profileTemplates, selected)
  const {users} = getState()
  const user = selectUser(users, uid)
  dispatch(setProfile(
    uid,
    profileItems.filter(i => -1 < profileTemplate.itemSet.indexOf(i.key))
      .reduce(
        (ret, cur) => {ret[cur.key] = {val: cur.default, pids: []}; return ret},
        {
          tag: user.profiles.filter(p => p.tag === selected).length
            ? addTagSuffix(user.profiles, selected)
            : selected,
          pids: [],
        }
      )
  ))
}

export const updateProfileTag = (uid, i, tag) => (dispatch, getState) => {
  const {users} = getState()
  const user = selectUser(users, uid)
  dispatch(setProfile(
    uid,
    {
      ...user.profiles[i],
      tag,
    },
    i
  ))
}

export const updateProfileVal = (uid, i, key, val) => (dispatch, getState) => {
  const {users} = getState()
  const user = selectUser(users, uid)
  let profile = user.profiles[i]
  profile[key] = {...profile[key], val}
  dispatch(setProfile(
    uid,
    profile,
    i,
  ))
}
