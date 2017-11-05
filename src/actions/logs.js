/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

export const getLogs = async (ctx) => {
  let {from, to} = ctx.request.params
  let {Log} = ctx.models
  return (await Log.findAll({
    where: {createdAt: {$between: [
      new Date(from),
      new Date(to),
    ]}},
    order: [['createdAt', 'DESC']],
  })).map(l => l.get({plain: true}))
}
