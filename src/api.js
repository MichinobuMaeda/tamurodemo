'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import bunyan from 'bunyan'
import { MongoClient } from 'mongodb'
import shortid from 'shortid'
import crypto from 'crypto'
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import template from './template'

class LogStream {
  constructor(logs) {this.logs = logs }
  write(rec) { this.logs.save(JSON.parse(rec)) }
}

export default class Api {
  constructor(conf) {
    this.conf = conf
  }

  async init() {

    // Storage Service =========================================

    this.db = await MongoClient.connect(this.conf.mongoUri)

    this.users = this.db.collection('users')
    this.groups = this.db.collection('groups')
    this.prims = this.db.collection('prims')
    this.creds = this.db.collection('creds')
    this.sessions = this.db.collection('sessions')
    this.logs = this.db.collection('logs')
    this.log = bunyan.createLogger({
      name: 'tamuro-api',
      streams: [{ stream: new LogStream(this.logs) }]
    })

    await this.users.createIndex({ name: 1 }, { unique: true })
    await this.users.createIndex({ modifiedAt: 1 })

    await this.groups.createIndex({ name: 1 }, { unique: true })
    await this.groups.createIndex({ uids: 1 })
    await this.groups.createIndex({ gids: 1 })
    await this.groups.createIndex({ modifiedAt: 1 })

    await this.creds.createIndex({ uid: 1, provider: 1 }, { unique: true })
    await this.creds.createIndex({ provider: 1, authId: 1 }, { unique: true })
    await this.creds.createIndex({ modifiedAt: 1 })

    await this.sessions.createIndex({ createdAt: 1 })

    await this.logs.createIndex({ createdAt: 1 })

    // Validator ===============================================

    this.users.validate = async (
      { _id, ver, name, profile, createdAt, modifiedAt } = {},
      depends = true
    ) => {
      _id = _id ? _id : shortid.generate()
      ver = parseInt(ver, 10)
      ver = isNaN(ver) ? 0 : ver
      profile = profile ? profile : {}
      createdAt = createdAt ? new Date(createdAt) : new Date()
      modifiedAt = modifiedAt ? new Date(modifiedAt) : createdAt
      let errors = []
        .concat(!isStringFilled(name)
          ? [{ path: 'name', req: 'required' }]
          : (depends && 0 !== (await this.users.count({ name, _id: { $ne: _id } }))
            ? [{ path: 'name', req: 'unique' }]: []))
        .concat(
          !isObject(profile)
            ? [{ path: 'profile', req: 'object' }]
            : [])
      return errors.length ? { errors }
        : { _id, ver, name, profile, createdAt, modifiedAt }
    }

    this.groups.validate = async (
      { _id, ver, name, gids, uids, createdAt, modifiedAt } = {},
      depends = true
    ) => {
      _id = _id ? _id : shortid.generate()
      ver = parseInt(ver, 10)
      ver = isNaN(ver) ? 0 : ver
      gids = gids ? gids : []
      uids = uids ? uids : []
      createdAt = createdAt ? new Date(createdAt) : new Date()
      modifiedAt = modifiedAt ? new Date(modifiedAt) : createdAt
      let errors = []
        .concat(!isStringFilled(name)
          ? [{ path: 'name', req: 'required' }]
          : (depends && 0 !== (await this.groups.count({ name, _id: { $ne: _id } }))
            ? [{ path: 'name', req: 'unique' }]: []))
        .concat(!isArray(gids)
          ? [{ path: 'gids', req: 'array' }]
          : (await gids.reduce(async (ret, gid) =>
            depends && 0 === (await this.groups.count({ _id: gid }))
              ? [...ret, { path: 'gids', req: 'reference' }] : ret, [])))
        .concat(!isArray(uids) 
          ? [{ path: 'uids', req: 'array' }]
          : (await uids.reduce(async (ret, uid) =>
            depends && 0 === (await this.users.count({ _id: uid }))
              ? [...ret, { path: 'uids', req: 'reference' }] : ret, [])))
      return errors.length ? { errors }
        : { _id, ver, name, gids, uids, createdAt, modifiedAt }
    }

    this.creds.validate = async (
      { _id, ver, uid, provider, authId, password, createdAt, modifiedAt } = {},
      depends = true
    ) => {
      _id = _id ? _id : shortid.generate()
      ver = parseInt(ver, 10)
      ver = isNaN(ver) ? 0 : ver
      uid = uid ? uid.toString() : uid
      createdAt = createdAt ? new Date(createdAt) : new Date()
      modifiedAt = modifiedAt ? new Date(modifiedAt) : createdAt
      let errors = []
        .concat(!isStringFilled(uid)
          ? [{ path: 'uid', req: 'required' }]
          : (depends && 0 === (await this.users.count({ _id: uid }))
            ? [{ path: 'uid', req: 'reference' }]: []))
        .concat(!isStringFilled(provider)
          ? [{ path: 'provider', req: 'required' }]
          : [])
        .concat(!isStringFilled(authId)
          ? [{ path: 'authId', req: 'required' }]
          : (depends && 0 < (await this.creds.count({ provider, authId, uid: { $ne: uid } }))
            ? [{ path: 'authId', req: 'unique' }]: []))
        .concat(provider === 'password' && !isStringFilled(password)
          ? [{ path: 'password', req: 'required' }]
          : [])
      return errors.length ? { errors }
        : { _id, ver, uid, provider, authId, password, createdAt, modifiedAt }
    }

    // HTTP Service ============================================

    this.api = new Koa()
    this.api.keys = [this.conf.appKey]
    this.router = new Router({
      prefix: this.conf.prefix
    })

    // Routes ==================================================

    this.router
      .get('/',
        async ctx => {
          if (!this.prim) {
            ctx.response.body = {}
            return
          }
          ctx.response.body = await getTop(this, ctx.session)
        })

      .get('/setup',
        ctx => {
          ctx.response.body = this.prim
            ? template.completeHtml()
            : template.setupHtml({ path: ctx.request.path })
        })

      .post('/setup',
        async ctx => {
          if (this.prim) {
            ctx.response.status = 404
            return
          }
          let { top, admin, manager, name, authId } = ctx.request.body
          this.log.info({
            method: ctx.request.method,
            path: ctx.request.path,
            top, admin, manager, name, authId
          })
          let errors = validateSetupObjects(ctx.request.body)
          if (errors) {
            errors = errors.join('\n')
            ctx.response.body = template.setupHtml({
              errors,
              path: ctx.request.path,
              top, admin, manager, name, authId
            })
            return
          }
          this.prim = await saveSetupObjects(this, ctx.request.body)
          ctx.redirect(ctx.request.path)
        })

      .post('/sessions',
        signOut(this), async ctx => {
          const cookieOption = { maxAge: this.conf.expires, signed: true }
          let ret = await this.authenticate(ctx.request.body)
          let sid = ret.errors ? '' : ret._id
          this.log.info({ method: 'POST', path: '/sessions', SID: sid })
          ctx.cookies.set('SID', sid, cookieOption)
          ctx.response.body = ret.errors ? ret : (await getTop(this, true))
        })

      .get('/sessions',
        authAdmin(), async ctx => {
          ctx.response.body = await this.sessions.find({}).sort({ createdAt: -1 }).toArray()
        })

      .del('/sessions',
        signOut(this), async ctx => {
          ctx.response.body = (await getTop(this, false))
        })

      .get('/users',
        authManager(), async ctx => {
          ctx.response.body = await this.users.find({}).sort({ name: 1 }).toArray()
        })

      .get('/users/:uid',
        authMember(), getBaseUser(this), ctx => {
          ctx.response.body = ctx.base
        })

      .put('/users/:uid/ver/:ver',
        authSelfOrManager(), validate(this.users), async ctx => {
          ctx.response.body = await updateDoc(this.users, {
            _id: ctx.params.uid,
            ver: parseInt(ctx.params.ver, 10)
          }, ctx.validated)
        })

      .del('/users/:uid/ver/:ver',
        authManager(), async ctx => {
          ctx.response.body = (await this.users.findOneAndDelete({
            _id: ctx.params.uid,
            ver: parseInt(ctx.params.ver, 10)
          })).value ? {} : { errors: [ { path: 'ver', req: 'latest' } ]}
        })

      .get('/groups',
        authManager(), async ctx => {
          ctx.response.body = await this.groups.find({}).sort({ name: 1 }).toArray()
        })

      .get('/groups/:gid',
        authMember(), getBaseGroup(this), ctx => {
          ctx.response.body = ctx.base
        })

      .put('/groups/:gid/ver/:ver',
        authManager(), validate(this.groups), async ctx => {
          ctx.response.body = await updateDoc(this.groups, {
            _id: ctx.params.gid,
            ver: parseInt(ctx.params.ver, 10)
          }, ctx.validated)
        })

      .del('/groups/:gid/ver/:ver',
        authManager(), async ctx => {
          ctx.response.body = (await this.groups.findOneAndDelete({
            _id: ctx.params.gid,
            ver: parseInt(ctx.params.ver, 10)
          })).value ? {} : { errors: [ { path: 'ver', req: 'latest' } ]}
        })

      .post('/groups/:gid/users',
        authManager(), getBaseGroup(this), validate(this.users), async ctx => {
          let user = ctx.validated
          ctx.base.uids.push(user._id)
          await this.groups.findOneAndUpdate({ _id: ctx.base._id }, ctx.base)
          await this.users.save(user)
          ctx.response.body = await this.users.findOne({ _id: user._id })
        })

      .get('/groups/:gid/users',
        authMember(), getBaseGroup(this), async ctx => {
          ctx.response.body = await this.users.find(
            { _id: { $in: ctx.base.uids } }).sort({ name: 1 }).toArray()
        })

      .post('/groups/:gid/groups',
        authManager(), getBaseGroup(this), validate(this.groups), async ctx => {
          let group = ctx.validated
          ctx.base.gids.push(group._id)
          await this.groups.findOneAndUpdate({ _id: ctx.base._id }, ctx.base)
          await this.groups.save(group)
          ctx.response.body = await this.groups.findOne({ _id: group._id })
        })

      .get('/groups/:gid/groups', authMember(), getBaseGroup(this), async ctx => {
        ctx.response.body = await this.groups.find(
          { _id: { $in: ctx.base.gids } }).sort({ name: 1 }).toArray()
      })

      .post('/users/:uid/provider/:provider',
        authSelfOrManager(), referUser(this), validate(this.creds), async ctx => {
          let { uid, provider } = ctx.params
          if (await this.creds.count({ uid, provider })) {
            ctx.response.body = { errors: [ { path: 'provider', req: 'unique' } ] }
            return
          }
          let cred = ctx.validated
          cred.uid = uid
          cred.provider = provider
          if (cred.password) {
            cred.password = this.digestPassword(cred.uid, cred.password)
          }
          await this.creds.save(cred)
          if (cred.password) { cred.password = '' }
          ctx.response.body = cred
        })

      .get('/users/:uid/creds',
        authSelfOrManager(), referUser(this), async ctx => {
          ctx.response.body = (await this.creds.find(
            { uid: ctx.params.uid }).sort({ provider: 1 }).toArray()).map(cred => {
            if (cred.password) { cred.password = '' }
            return cred
          })
        })

      .put('/users/:uid/provider/:provider/ver/:ver',
        authSelfOrManager(), referUser(this), validate(this.creds), async ctx => {
          let { uid, provider, ver } = ctx.params
          ver = parseInt(ver, 10)
          let cred = ctx.validated
          cred.uid = uid
          cred.provider = provider
          cred.ver = ver + 1
          cred.modifiedAt = new Date()
          if (cred.password) {
            cred.password = this.digestPassword(cred.uid, cred.password)
          }
          let ret = await this.creds.findOneAndUpdate({ _id: cred._id, uid, provider, ver }, cred)
          if (ret.value) {
            if (cred.password) { cred.password = '' }
            ctx.response.body = cred
          } else {
            ctx.response.body = { errors: [ { path: 'ver', req: 'latest' } ]}
          }
        })

      .del('/users/:uid/provider/:provider/ver/:ver',
        authSelfOrManager(), referUser(this), async ctx => {
          let { uid, provider, ver } = ctx.params
          ver = parseInt(ver, 10)
          ctx.response.body = (await this.creds.findOneAndDelete({ uid, provider, ver })).value
            ? {} : { errors: [ { path: 'ver', req: 'latest' } ]}
        })

    // Middleware ==============================================

    this.api
      .use(bodyParser())
      .use(getSession(this))
      .use(this.router.routes())

    // Start service ===========================================

    this.prim = await this.prims.findOne({})
    
    return this.api.listen(this.conf.port)
  }

  // Helpers ===================================================

  async authenticate({ provider, authId, password }) {
    let cred = await this.creds.findOne({ provider: provider, authId: authId })
    if (!cred) {
      this.log.info({ function: 'authenticate', result: 'NG', provider, authId })
      return { errors: [{ path: 'authId', req: 'reference' }]}
    }
    if (provider === 'password') {
      password = password ? this.digestPassword(cred.uid, password) : null
      if (cred.authId !== authId || cred.password !== password) {
        this.log.info({ function: 'authenticate', result: 'NG', provider, authId })
        return { errors: [{ path: '', req: 'auth' }] }
      }
    } else {
      this.log.info({ function: 'authenticate', result: 'NG', provider, authId })
      return { errors: [{ path: 'provider', req: 'reference' }] }
    }
    this.log.info({ function: 'authenticate', result: 'OK', uid: cred.uid })
    let gids = await this.getGroups(cred.uid)
    let sess = {
      _id: shortid.generate(),
      uid: cred.uid,
      provider: provider,
      gids: gids,
      admin: (gids.indexOf(this.prim.admin) > -1),
      manager: (gids.indexOf(this.prim.manager) > -1),
      createdAt: new Date(),
    }
    this.log.info(sess)
    await this.sessions.save(sess)
    return sess
  }

  digestPassword(uid, password) {
    let hash = crypto.createHash('sha256')
    hash.update(`${uid}:${this.conf.seed}:${password}`)
    return hash.digest('hex')
  }

  async getGroups(id) {
    let ret = []
    if (!id) { return ret }
    let gids = []
    if (Object.prototype.toString.call(id) !== '[object Array]') {
      gids = (await this.groups.find({ uids: id }).toArray())
    } else {
      ret = ret.concat(id)
      gids = await this.groups.find({ gids: { $in: id } }).toArray()
    }
    gids = gids.map(g => g._id.toString()).filter(v => ret.indexOf(v) < 0)
    return gids.length === 0 ? ret : this.getGroups(ret.concat(gids))
  }
}

// Middleware ===================================================

const signOut = api => async (ctx, next) => {
  let sid = ctx.cookies.get('SID', { signed: true })
  if (sid) {
    api.log.info({ function: 'signOut', SID: sid })
    await api.sessions.findOneAndDelete({ _id: sid })
  }
  await next()
}

const getSession = api => async (ctx, next) => {
  let sid = ctx.cookies.get('SID', { signed: true })
  let sess = sid ? (await api.sessions.findOne({ _id: sid })) : null
  if (sess && (sess.createdAt.getTime() + api.conf.expires) < new Date().getTime()) {
    await api.sessions.findOneAndDelete({ _id: sid })
    sess = null
  }
  ctx.session = sess
  await next()
}

const authMember = () => async (ctx, next) => {
  if (!ctx.session) {
    ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
  } else {
    await next()
  }
}

const authAdmin = () => async (ctx, next) => {
  if (!ctx.session) {
    ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
  } else if (!ctx.session.admin) {
    ctx.response.body = { errors: [{ path: 'priv', req: 'admin' }] }
  } else {
    await next()
  }
}

const authManager = () =>async (ctx, next) => {
  if (!ctx.session) {
    ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
  } else if (!ctx.session.manager) {
    ctx.response.body = { errors: [{ path: 'priv', req: 'manager' }] }
  } else {
    await next()
  }
}

const authSelfOrManager = () => async (ctx, next) => {
  if (!ctx.session) {
    ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
  } else if ((!ctx.session.manager) && (ctx.params.uid !== ctx.session.uid)) {
    ctx.response.body = { errors: [{ path: 'priv', req: 'manager|uid' }] }
  } else {
    await next()
  }
}

const referUser = api => async (ctx, next) => {
  if (await api.users.count({ _id: ctx.params.uid })) {
    await next()
  } else {
    ctx.response.body = { errors: [ { path: 'uid', req: 'reference' } ] }
  }
}

const getBaseUser = api => async (ctx, next) => {
  let base = await api.users.findOne({ _id: ctx.params.uid })
  if (base) {
    ctx.base = base
    await next()
  } else {
    ctx.response.body = { errors: [ { path: 'uid', req: 'reference' } ] }
  }
}

const getBaseGroup = api => async (ctx, next) => {
  let base = await api.groups.findOne({ _id: ctx.params.gid })
  if (base) {
    ctx.base = base
    await next()
  } else {
    ctx.response.body = { errors: [ { path: 'gid', req: 'reference' } ] }
  }
}

const validate = (collection) => async (ctx, next) => {
  let obj = await collection.validate(ctx.request.body)
  if (obj.errors) {
    ctx.response.body = obj
  } else {
    ctx.validated = obj
    await next()
  }
}

// Helpers ===================================================

function validateSetupObjects(req) {
  let { top, admin, manager, name, authId, password, confirm } = req
  let errors = []
    .concat(!isStringFilled(top)      ? ['Required: Title'] : [])
    .concat(!isStringFilled(admin)    ? ['Required: Admin Group Name'] : [])
    .concat(!isStringFilled(manager)  ? ['Required: Manager Group Name'] : [])
    .concat(!isStringFilled(name)     ? ['Required: Your name'] : [])
    .concat(!isStringFilled(authId)   ? ['Required: Your ID'] : [])
    .concat(!isStringFilled(password) ? ['Required: Your password'] : [])
    .concat(password !== confirm      ? ['Required: Type password again'] : [])
  return errors.length ? errors : null
}

async function saveSetupObjects(api, req) {
  let { top, admin, manager, name, authId, password } = req
  let ts = new Date()
  let user = await api.users.validate({
    name: name, createdAt: ts
  }, false)
  await api.users.save(user)
  let cred = await api.creds.validate({
    uid: user._id,
    provider: 'password',
    authId: authId,
    password: api.digestPassword(user._id, password),
    createdAt: ts,
  }, false)
  await api.creds.save(cred)
  let groupA = await api.groups.validate({
    name: admin,
    uids: [user._id],
    createdAt: ts,
  }, false)
  await api.groups.save(groupA)
  let groupM = await api.groups.validate({
    name: manager,
    uids: [user._id],
    createdAt: ts,
  }, false)
  await api.groups.save(groupM)
  let groupT = await api.groups.validate({
    name: top,
    gids: [groupA._id, groupM._id],
    createdAt: ts,
  }, false)
  await api.groups.save(groupT)
  let prim = {
    _id: shortid.generate(),
    ver: 0,
    top: groupT._id,
    admin: groupA._id,
    manager: groupM._id,
    createdAt: ts,
  }
  await api.prims.save(prim)
  return prim
}

async function updateDoc(collection, { _id, ver }, obj) {
  obj._id = _id
  obj.ver = ver + 1
  obj.modifiedAt = new Date()
  let ret = await collection.findOneAndUpdate({ _id, ver }, obj)
  return ret.value
    ? collection.findOne({ _id })
    : { errors: [ { path: 'ver', req: 'latest' } ]}
}

const getTop = async (api, isSession) => {
  const top = await api.groups.findOne({ _id: api.prim.top })
  return isSession ? top : { name: top.name }
}

// const isUndefined = (v) => Object.prototype.toString.call(v) === '[object Undefined]'
// const isNull = (v) =>  Object.prototype.toString.call(v) === '[object Null]'
const isString = (v) =>  Object.prototype.toString.call(v) === '[object String]'
// const isNumber = (v) =>  Object.prototype.toString.call(v) === '[object Number]'
// const isDate = (v) =>  Object.prototype.toString.call(v) === '[object Date]'
const isObject = (v) => Object.prototype.toString.call(v) === '[object Object]'
const isArray = (v) => Object.prototype.toString.call(v) === '[object Array]'
const isStringFilled = (v) =>  isString(v) && v.length > 0
