/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS} from '../constants'
import {respondError} from '../helper'

const sessionStore = () => async (ctx, next) => {
  let {conf, models, log} = ctx
  let {Session} = models
  const sid = ctx.cookies.get(conf.sid, {signed: true}) || ctx.cookies.get(conf.sid) || ''
  const sess = await restoreSession(conf, log, Session, sid)
  if (sess.errors) {
    ctx.session = {}
    ctx.response.body = {...sess}
  } else {
    ctx.session = {...sess}
    await next()
  }
  const updated = ctx.session._id || ''
  if ((sess._id || '') !== updated) {
    log.info({
      function: 'sessionStore',
      action: 'return sid',
      sid: updated,
    })
    ctx.cookies.set(conf.sid, updated, {signed: true, overwrite: true})
  }
}

const restoreSession = async (conf, log, Session, sid) => {
  if (!sid) {return {}}
  let sess = await Session.findById(sid)
  if (!sess) {
    log.warn({
      function: 'restoreSession',
      action: 'failed to restore',
      sid,
    })
    return {}
  }
  if ((sess.get('createdAt').getTime() + conf.expires) < new Date().getTime()) {
    await sess.destroy()
    log.warn({
      function: 'restoreSession',
      action: 'delete expired',
      sid,
    })
    return respondError(ERRORS.SESSION_EXPIRED)
  }
  return sess.get({plain: true})
}

export default sessionStore
