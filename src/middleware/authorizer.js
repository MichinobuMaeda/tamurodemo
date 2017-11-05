/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {PRIV} from '../constants'

const authorizer = () => async (ctx, next) => {
  let {priv} = ctx.route
  let {params} = ctx.request
  let {uid, oids, isAdmin, isManager} = ctx.session

  switch (priv) {
  case PRIV.ADMIN: {
    if (!uid || !isAdmin) {ctx.throw(403)}
    break
  }
  case PRIV.MANAGER: {
    if (!uid || !isManager) {ctx.throw(403)}
    break
  }
  case PRIV.OWNER: {
    if (!uid || (!isManager && 0 > oids.indexOf(params.gid))) {ctx.throw(403)}
    break
  }
  case PRIV.USER: {
    if (!uid || (!isManager && uid !== params.uid)) {ctx.throw(403)}
    break
  }
  case PRIV.MEMBER: {
    if (!uid) {ctx.throw(403)}
    break
  }
  case PRIV.GUEST: {
    break
  }
  default:
    ctx.throw(404)
  }

  await next()
}

export default authorizer
