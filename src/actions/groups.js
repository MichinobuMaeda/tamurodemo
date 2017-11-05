/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS} from '../constants'
import {getGroupWithDepends, respondError} from '../helper'

export const getGroups = async ctx => {
  let {Group} = ctx.models
  return (await Group.findAll({
    attributes: ['_id', 'name', 'role'],
    order: [['name', 'ASC']],
  })).map(g => ({
    _id: g._id,
    name: g.name,
    role: g.role
  }))
}

export const getGroup = async ctx => {
  let {gid} = ctx.request.params
  let {Group} = ctx.models
  let group = await Group.findOne({where: {_id: gid}})
  return group
    ? getGroupWithDepends(group)
    : respondError(ERRORS.DATA_REVISED, {gid})
}

export const updateGroup = async ctx => {
  let {gid, ver} = ctx.request.params
  let {Group} = ctx.models
  let {name, role, desc} = ctx.request.body
  ver = parseInt(ver, 10)
  let [hit, updated] = await Group.update({
    name, role, desc, ver: ver + 1
  }, {
    fields: ['name', 'role', 'desc', 'ver'],
    where: {_id: gid, ver},
    returning: true,
  })
  return (hit === 1)
    ? getGroupWithDepends(updated[0])
    : respondError(ERRORS.DATA_REVISED, {gid, ver})
}

export const deleteGroup = async ctx => {
  let {gid, ver} = ctx.request.params
  let {Group} = ctx.models
  ver = parseInt(ver, 10)
  let hit = await Group.destroy({where: {_id: gid, ver}})
  return (hit === 1)
    ? {}
    : respondError(ERRORS.DATA_REVISED, {gid, ver})
}

export const setGroupsOfGroup = async ctx => {
  let {gid} = ctx.request.params
  let {Group} = ctx.models
  let {gids} = ctx.request.body
  let group = await Group.findOne({where: {_id: gid}})
  if (!group) {
    return respondError(ERRORS.DATA_REVISED, {gid, gids})
  }
  let original = (await group.getGroups({attributes: ['_id']})).map(g => g._id)
  await Promise.all([
    ...original.filter(gid => 0 > gids.indexOf(gid)).map(gid => group.removeGroup(gid)),
    ...gids.filter(gid => 0 > original.indexOf(gid)).map(gid => group.addGroup(gid)),
  ])
  return getGroupWithDepends(group)
}
