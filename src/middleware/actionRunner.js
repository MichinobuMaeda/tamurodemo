/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

const actionRunner = () => async (ctx) => {
  if (!ctx.route.action) {ctx.throw(404)}
  let {db} = ctx.models
  await db.transaction(
    () => ctx.route.action(ctx)
      .then(res => ctx.response.body = res)
  )
}

export default actionRunner
