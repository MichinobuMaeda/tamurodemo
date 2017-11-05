/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS} from '../constants'
import {getGroupWithDepends, respondError} from '../helper'

export const setOwners = async ctx => {
  let {gid} = ctx.request.params
  let {Group} = ctx.models
  let {oids} = ctx.request.body
  let group = await Group.findOne({where: {_id: gid}})
  if (!group) {
    return respondError(ERRORS.DATA_REVISED, {gid, oids})
  }
  let original = (await group.getOwners({attributes: ['_id']})).map(u => u._id)
  await Promise.all([
    ...original.filter(oid => 0 > oids.indexOf(oid)).map(oid => group.removeOwner(oid)),
    ...oids.filter(oid => 0 > original.indexOf(oid)).map(oid => group.addOwner(oid)),
  ])
  return getGroupWithDepends(group)
}
