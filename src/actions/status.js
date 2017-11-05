/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {GROUP_ROLE, PREFERENCE} from '../constants'

export const getStatus = async (ctx) => {
  let {session} = ctx
  let {Group, Preference} = ctx.models
  let title = await Preference.findOne({
    where: {pid: PREFERENCE.TITLE},
    attributes: ['ver', 'val'],
  })
  let top = await Group.findOne({
    where: {role: GROUP_ROLE.TOP},
    attributes: ['_id', 'name', 'role'],
  })
  return title && top
    ? session && session.uid
      ? {
        title: title.get({plain: true}),
        top: top.get({plain: true}),
        session: {...session, _id: null},
      }
      : {
        title: {val: title.val},
        top: {name: top.name},
        session: {},
      }
    : {}
}
