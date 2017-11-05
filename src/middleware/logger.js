/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'

import {LOG_LEVEL} from '../constants'

const logger = () => async (ctx, next) => {
  let conf = ctx.conf
  let Log = ctx.models.Log
  const sid = ctx.cookies.get(conf.sid, {signed: true}) || ctx.cookies.get(conf.sid) || 'unknown'
  ctx.log = {
    info: (rec) => saveLog(Log, LOG_LEVEL.INFO, sid, rec),
    warn: (rec) => saveLog(Log, LOG_LEVEL.WARN, sid, rec),
    error: (rec) => saveLog(Log, LOG_LEVEL.ERROR, sid, rec),
  }
  await requestLog(Log, sid, ctx.request)
  try {
    await next()
    await errorLog(Log, sid, ctx.response.body)
  }
  catch(e) {
    await ctx.log.error(
      e.status
        ? {status: e.status, message: e.message}
        : e
    )
    ctx.throw(e.status || 500)
  }
}

const requestLog = async (Log, sid, {method, path}) => {
  if (method === 'GET') {return}
  await saveLog(Log, LOG_LEVEL.INFO, sid, {method, path})
}

const errorLog = async (Log, sid, body) => {
  if (!body) {return}
  let {errors} = body
  if (!errors) {return}
  await saveLog(Log, LOG_LEVEL.ERROR, sid, {errors})
}

const saveLog = (Log, level, sid, rec) => {
  return Log.create({
    _id: shortid.generate(),
    level,
    sid,
    rec,
    createdAt: new Date(),
  })
}

export default logger
