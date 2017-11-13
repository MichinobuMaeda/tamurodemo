/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS} from '../constants'
import {getUserWithDepends, respondError} from '../helper'

export const getUsers = async ctx => {
  let {User} = ctx.models
  return (await User.findAll({
    attributes: ['_id', 'name'],
    order: [['name', 'ASC']],
  })).map(u => ({
    _id: u._id,
    name: u.name,
  }))
}

export const getUser = async ctx => {
  let {uid} = ctx.request.params
  let {User} = ctx.models
  let user = await User.findOne({where: {_id: uid}})
  return user
    ? filterUser(await getUserWithDepends(user), ctx.session)
    : respondError(ERRORS.DATA_REVISED, {uid})
}

export const updateUser = async ctx => {
  let {uid, ver} = ctx.request.params
  let {name, desc, profiles} = ctx.request.body
  let {User} = ctx.models
  ver = parseInt(ver, 10)
  let [hit, updated] = await User.update({
    name, desc, profiles, ver: ver + 1
  }, {
    fields: ['name', 'desc', 'profiles', 'ver'],
    where: {_id: uid, ver},
    returning: true,
  })
  return (hit === 1)
    ? filterUser(await getUserWithDepends(updated[0]), ctx.session)
    : respondError(ERRORS.DATA_REVISED, {uid, ver})
}

export const deleteUser = async ctx => {
  let {uid, ver} = ctx.request.params
  let {User} = ctx.models
  ver = parseInt(ver, 10)
  let hit = await User.destroy({where: {_id: uid, ver: ver}})
  return (hit === 1)
    ? {}
    : respondError(ERRORS.DATA_REVISED, {uid, ver})
}

export const setGroupsOfUser = async ctx => {
  let {uid} = ctx.request.params
  let {User} = ctx.models
  let {gids} = ctx.request.body
  let user = await User.findOne({where: {_id: uid}})
  if (!user) {
    return respondError(ERRORS.DATA_REVISED, {uid, gids})
  }
  let original = (await user.getGroups({attributes: ['_id']})).map(g => g._id)
  await Promise.all([
    ...original.filter(gid => 0 > gids.indexOf(gid)).map(gid => user.removeGroup(gid)),
    ...gids.filter(gid => 0 > original.indexOf(gid)).map(gid => user.addGroup(gid)),
  ])
  return getUserWithDepends(user)
}

const hasPrivilege = (pids, gids) =>
  !pids || pids.reduce((ret, cur) => gids && -1 < gids.indexOf(cur) || ret, false)

export const filterUser = (user, sess) => {
  let {_id, profiles, ...others} = user
  let {uid, gids, isManager} = sess
  return isManager || _id === uid ? user : {
    _id,
    profiles: profiles
      .filter(prof => hasPrivilege(prof.pids, gids))
      .map(prof => ({
        tag: prof.tag,
        ...(
          Object.keys(prof)
            .filter(key => 0 > ['tag', 'pids'].indexOf(key) && hasPrivilege(prof[key].pids, gids))
            .reduce((ret, cur) => {ret[cur] = {val: prof[cur].val}; return ret}, {})
        )
      })),
    ...others,
  }
}
