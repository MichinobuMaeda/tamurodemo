/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'
import {ERRORS} from '../constants'
import {getGroupWithDepends, respondError} from '../helper'

export const createMember = async ctx => {
  let {gid} = ctx.request.params
  let {name, desc, profiles} = ctx.request.body
  let {Group} = ctx.models
  try {
    let group = await Group.findOne({where: {_id: gid}})
    let _id = shortid.generate()
    await group.createUser({_id, name, desc, profiles})
    return getGroupWithDepends(group)
  } catch (e) {
    return respondError(ERRORS.DATA_REVISED, {gid})
  }
}

export const setMembers = async ctx => {
  let {gid} = ctx.request.params
  let {Group} = ctx.models
  let {uids} = ctx.request.body
  let group = await Group.findOne({where: {_id: gid}})
  if (!group) {
    return respondError(ERRORS.DATA_REVISED, {gid, uids})
  }
  let original = (await group.getUsers({attributes: ['_id']})).map(u => u._id)
  await Promise.all([
    ...original.filter(uid => 0 > uids.indexOf(uid)).map(uid => group.removeUser(uid)),
    ...uids.filter(uid => 0 > original.indexOf(uid)).map(uid => group.addUser(uid)),
  ])
  return getGroupWithDepends(group)
}
