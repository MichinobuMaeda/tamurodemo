/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import routes from './routes'
import logger from './middleware/logger'
import sessionStore from './middleware/sessionStore'
import router from './middleware/router'
import authorizer from './middleware/authorizer'
import actionRunner from './middleware/actionRunner'

const server = (conf, providers, models) => {
  let koa = new Koa()
  koa.keys = [conf.appKey]
  koa
    .use(async (ctx, next) => {
      ctx.conf = conf
      ctx.models = models
      ctx.providers = providers
      await next()
    })
    .use(bodyParser())
    .use(logger())
    .use(sessionStore())
    .use(router(routes))
    .use(authorizer())
    .use(actionRunner())
  let http = koa.listen(conf.port)

  return {http, db: models.db}
}

export default server
