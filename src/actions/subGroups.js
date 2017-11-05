/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'
import {ERRORS} from '../constants'
import {getGroupWithDepends, respondError} from '../helper'

export const createSubGroup = async ctx => {
  let {gid} = ctx.request.params
  let {Group} = ctx.models
  try {
    let group = await Group.findOne({where: {_id: gid}})
    let {name, role, desc} = ctx.request.body
    let _id = shortid.generate()
    await group.createSubGroup({_id, name, role, desc})
    return getGroupWithDepends(group)
  } catch (e) {
    return respondError(ERRORS.DATA_REVISED, {gid})
  }
}

export const setSubGroups = async ctx => {
  let {gid} = ctx.request.params
  let {Group} = ctx.models
  let {sids} = ctx.request.body
  let group = await Group.findOne({where: {_id: gid}})
  if (!group) {
    return respondError(ERRORS.DATA_REVISED, {gid, sids})
  }
  let original = (await group.getSubGroups({attributes: ['_id']})).map(g => g._id)
  await Promise.all([
    ...original.filter(sid => 0 > sids.indexOf(sid)).map(sid => group.removeSubGroup(sid)),
    ...sids.filter(sid => 0 > original.indexOf(sid)).map(sid => group.addSubGroup(sid)),
  ])
  return getGroupWithDepends(group)
}
