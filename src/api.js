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

export class LogStream {
  constructor(logs) {this.logs = logs }
  write(rec) { this.logs.save(JSON.parse(rec)) }
}

export default class Api {
  constructor(conf) {
    this.conf = conf
  }

  async init() {
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

    this.prim = null
    this.api = new Koa()
    this.api.keys = [this.conf.appKey]
    this.router = new Router({
      prefix: this.conf.prefix
    })

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

    // Resist routes ===========================================

    this.router
      .get('/', async (ctx) => {
        if (!this.prim) {
          ctx.response.body = {}
          return
        }
        let top = await this.groups.findOne({ _id: this.prim.top })
        ctx.response.body = ctx.session ? top : { name: top.name }
      })

      .get('/setup', (ctx) => {
        if (this.prim) {
          ctx.response.body = template.completeHtml()
        } else {
          ctx.response.body = template.setupHtml({ path: ctx.request.path })
        }
      })

      .post('/setup', async (ctx) => {
        if (this.prim) {
          ctx.response.status = 404
          return
        }
        let { top, admin, manager, name, authId, password, confirm } = ctx.request.body
        this.log.info({
          method: ctx.request.method,
          path: ctx.request.path,
          top, admin, manager, name, authId
        })
        let errors = []
          .concat(!isStringFilled(top)      ? ['Required: Title'] : [])
          .concat(!isStringFilled(admin)    ? ['Required: Admin Group Name'] : [])
          .concat(!isStringFilled(manager)  ? ['Required: Manager Group Name'] : [])
          .concat(!isStringFilled(name)     ? ['Required: Your name'] : [])
          .concat(!isStringFilled(authId)   ? ['Required: Your ID'] : [])
          .concat(!isStringFilled(password) ? ['Required: Your password'] : [])
          .concat(password !== confirm      ? ['Required: Type password again'] : [])
        if (errors.length) {
          errors = errors.join('\n')
          ctx.response.body = template.setupHtml({
            errors, path: ctx.request.path, top, admin, manager, name, authId
          })
          return
        }
        let ts = new Date()
        let user = await this.users.validate({
          name: name, createdAt: ts
        }, false)
        await this.users.save(user)
        let cred = await this.creds.validate({
          uid: user._id,
          provider: 'password',
          authId: authId,
          password: this.digestPassword(user._id, password),
          createdAt: ts,
        }, false)
        await this.creds.save(cred)
        let groupA = await this.groups.validate({
          name: admin,
          uids: [user._id],
          createdAt: ts,
        }, false)
        await this.groups.save(groupA)
        let groupM = await this.groups.validate({
          name: manager,
          uids: [user._id],
          createdAt: ts,
        }, false)
        await this.groups.save(groupM)
        let groupT = await this.groups.validate({
          name: top,
          gids: [groupA._id, groupM._id],
          createdAt: ts,
        }, false)
        await this.groups.save(groupT)
        let prim = {
          _id: shortid.generate(),
          ver: 0,
          top: groupT._id,
          admin: groupA._id,
          manager: groupM._id,
          createdAt: ts,
        }
        await this.prims.save(prim)
        this.prim = prim
        ctx.redirect(ctx.request.path)
      })

      .post('/sessions', async (ctx) => {
        const cookieOption = { maxAge: this.conf.expires, signed: true }
        await this.signOut(ctx)
        let ret = await this.authenticate(ctx.request.body)
        if (ret.errors) {
          this.log.info({ method: 'POST', path: '/sessions', SID: '' })
          ctx.cookies.set('SID', '', cookieOption)
          ctx.response.body = ret
        } else {
          this.log.info({ method: 'POST', path: '/sessions', SID: ret._id.toString() })
          ctx.cookies.set('SID', ret._id.toString(), cookieOption)
          this.log.info(ret)
          ctx.response.body = await this.groups.findOne({ _id: this.prim.top })
        }
      })

      .get('/sessions', this.authAdmin, async (ctx) => {
        ctx.response.body = await this.sessions.find({}).sort({ createdAt: -1 }).toArray()
      })

      .del('/sessions', async (ctx) => {
        await this.signOut(ctx)
        let top = await this.groups.findOne( { _id: this.prim.top })
        ctx.response.body = { name: top.name }
      })

      .get('/users', this.authManager, async (ctx) => {
        ctx.response.body = await this.users.find({}).sort({ name: 1 }).toArray()
      })

      .get('/users/:uid', this.authMember, async (ctx) => {
        let user = await this.users.findOne({ _id: ctx.params.uid })
        ctx.response.body = user ? user
          : { errors: [ { path: 'uid', req: 'reference' } ] }
      })

      .put('/users/:uid/ver/:ver', this.authSelfOrManager, async (ctx) => {
        ctx.response.body = await this.update(this.users, {
          _id: ctx.params.uid,
          ver: ctx.params.ver
        }, ctx.request.body)
      })

      .del('/users/:uid/ver/:ver', this.authManager, async (ctx) => {
        ctx.response.body = await this.delete(this.users, {
          _id: ctx.params.uid,
          ver: ctx.params.ver
        })
      })

      .get('/groups', this.authManager, async (ctx) => {
        ctx.response.body = await this.groups.find({}).sort({ name: 1 }).toArray()
      })

      .get('/groups/:gid', this.authMember, async (ctx) => {
        let group = await this.groups.findOne({ _id: ctx.params.gid })
        ctx.response.body = group ? group
          : { errors: [ { path: 'gid', req: 'reference' } ] }
      })

      .put('/groups/:gid/ver/:ver', this.authManager, async (ctx) => {
        ctx.response.body = await this.update(this.groups, {
          _id: ctx.params.gid,
          ver: ctx.params.ver
        }, ctx.request.body)
      })

      .del('/groups/:gid/ver/:ver', this.authManager, async (ctx) => {
        ctx.response.body = await this.delete(this.groups, {
          _id: ctx.params.gid,
          ver: ctx.params.ver
        })
      })

      .post('/groups/:gid/users', this.authManager, async (ctx) => {
        if (!(await this.groups.count({ _id: ctx.params.gid }))) {
          ctx.response.body = { errors: [ { path: 'gid', req: 'reference' } ] }
          return
        }
        let user = await this.users.validate(ctx.request.body)
        if (user.errors) {
          ctx.response.body = user
          return
        }
        let parent = await this.groups.findOne({ _id: ctx.params.gid })
        parent.uids.push(user._id)
        await this.users.save(user)
        await this.groups.findOneAndUpdate({ _id: ctx.params.gid }, parent)
        ctx.response.body = await this.users.findOne({ _id: user._id })
      })

      .get('/groups/:gid/users', this.authMember, async (ctx) => {
        let parent = await this.groups.findOne({ _id: ctx.params.gid })
        if (!parent) {
          ctx.response.body = { errors: [ { path: 'gid', req: 'reference' } ] }
          return
        }
        ctx.response.body = await this.users.find(
          { _id: { $in: parent.uids } }).sort({ name: 1 }).toArray()
      })

      .post('/groups/:gid/groups', this.authManager, async (ctx) => {
        if (!(await this.groups.count({ _id: ctx.params.gid }))) {
          ctx.response.body = { errors: [ { path: 'gid', req: 'reference' } ] }
          return
        }
        let group = await this.groups.validate(ctx.request.body)
        if (group.errors) {
          ctx.response.body = group
          return
        }
        let parent = await this.groups.findOne({ _id: ctx.params.gid })
        parent.gids.push(group._id)
        await this.groups.save(group)
        await this.groups.findOneAndUpdate({ _id: ctx.params.gid }, parent)
        ctx.response.body = await this.groups.findOne({ _id: group._id })
      })

      .get('/groups/:gid/groups', this.authMember, async (ctx) => {
        let parent = await this.groups.findOne({ _id: ctx.params.gid })
        if (!parent) {
          ctx.response.body = { errors: [ { path: 'gid', req: 'reference' } ] }
          return
        }
        ctx.response.body = await this.groups.find(
          { _id: { $in: parent.gids } }).sort({ name: 1 }).toArray()
      })

      .post('/users/:uid/creds/:provider', this.authSelfOrManager, async (ctx) => {
        let { uid, provider } = ctx.params
        if (!(await this.users.count({ _id: uid }))) {
          ctx.response.body = { errors: [ { path: 'uid', req: 'reference' } ] }
          return
        }
        if (await this.creds.count({ uid, provider })) {
          ctx.response.body = { errors: [ { path: 'provider', req: 'unique' } ] }
          return
        }
        ctx.request.body.uid = uid
        ctx.request.body.provider = provider
        let cred = await this.creds.validate(ctx.request.body)
        if (cred.errors) {
          ctx.response.body = cred
          return
        }
        if (cred.provider === 'password') {
          cred.password = this.digestPassword(cred.uid, cred.password)
        }
        await this.creds.save(cred)
        if (cred.password) { cred.password = '' }
        ctx.response.body = cred
      })

      .get('/users/:uid/creds', this.authSelfOrManager, async (ctx) => {
        if (!(await this.users.count({ _id: ctx.params.uid }))) {
          ctx.response.body = { errors: [ { path: 'uid', req: 'reference' } ] }
          return
        }
        ctx.response.body = (await this.creds.find(
          { uid: ctx.params.uid }).sort({ provider: 1 }).toArray()).map(cred => {
          if (cred.password) { cred.password = '' }
          return cred
        })
      })

      .put('/users/:uid/creds/:provider/ver/:ver', this.authSelfOrManager, async (ctx) => {
        let { uid, provider, ver } = ctx.params
        ver = parseInt(ver, 10)
        ctx.request.body.uid = uid
        ctx.request.body.provider = provider
        let cred = await this.creds.validate(ctx.request.body)
        if (cred.errors) {
          ctx.response.body = cred
          return
        }
        if (cred.provider === 'password') {
          cred.password = this.digestPassword(cred.uid, cred.password)
        }
        ++ cred.ver
        cred.modifiedAt = new Date()
        let ret = await this.creds.findOneAndUpdate({ uid, provider, ver }, cred)
        if (ret.value) {
          if (cred.password) { cred.password = '' }
          ctx.response.body = cred
        } else {
          ctx.response.body = { errors: [ { path: 'ver', req: 'latest' } ]}
        }
      })

      .del('/users/:uid/creds/:provider/ver/:ver', this.authSelfOrManager, async (ctx) => {
        let { uid, provider, ver } = ctx.params
        ver = parseInt(ver, 10)
        let ret = await this.creds.findOneAndDelete({ uid, provider, ver })
        if (ret.value) {
          ctx.response.body = {}
        } else {
          ctx.response.body = { errors: [ { path: 'ver', req: 'latest' } ]}
        }
      })

    // Resist middleware =======================================

    this.api
      .use(bodyParser())
      .use(async (ctx, next) => {
        let sid = ctx.cookies.get('SID', { signed: true })
        let sess = sid ? (await this.sessions.findOne({ _id: sid })) : null
        if (sess && (sess.createdAt.getTime() + this.conf.expires) < new Date().getTime()) {
          await this.sessions.findOneAndDelete({ _id: sid })
          sess = null
        }
        ctx.session = sess
        await next()
      })
      .use(this.router.routes())
    
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
    await this.sessions.save(sess)
    return sess
  }

  async signOut(ctx) {
    let sid = ctx.cookies.get('SID', { signed: true })
    if (!sid) { return }
    this.log.info({ function: 'signOut', SID: sid })
    await this.sessions.findOneAndDelete({ _id: sid })
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

  async authMember(ctx, next) {
    if (!ctx.session) {
      ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
    } else {
      await next()
    }
  }

  async authAdmin(ctx, next) {
    if (!ctx.session) {
      ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
    } else if (!ctx.session.admin) {
      ctx.response.body = { errors: [{ path: 'priv', req: 'admin' }] }
    } else {
      await next()
    }
  }

  async authManager(ctx, next) {
    if (!ctx.session) {
      ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
    } else if (!ctx.session.manager) {
      ctx.response.body = { errors: [{ path: 'priv', req: 'manager' }] }
    } else {
      await next()
    }
  }

  async authSelfOrManager(ctx, next) {
    if (!ctx.session) {
      ctx.response.body = { errors: [{ path: '', req: 'signin' }] }
    } else if ((!ctx.session.manager) && (ctx.params.uid !== ctx.session.uid)) {
      ctx.response.body = { errors: [{ path: 'priv', req: 'manager|uid' }] }
    } else {
      await next()
    }
  }

  async update(collection, { _id, ver }, obj) {
    ver = parseInt(ver, 10)
    obj._id = _id
    obj.ver = ver + 1
    obj.modifiedAt = new Date()
    obj = await collection.validate(obj)
    if (obj.errors) { return obj }
    let ret = await collection.findOneAndUpdate({ _id, ver }, obj)
    return ret.value
      ? collection.findOne({ _id })
      : { errors: [ { path: 'ver', req: 'latest' } ]}
  }

  async delete(collection, { _id, ver }) {
    ver = parseInt(ver, 10)
    let ret = await collection.findOneAndDelete({ _id, ver })
    return ret.value
      ? {}
      : { errors: [ { path: 'ver', req: 'latest' } ]}
  }
}

// const isUndefined = (v) => Object.prototype.toString.call(v) === '[object Undefined]'
// const isNull = (v) =>  Object.prototype.toString.call(v) === '[object Null]'
const isString = (v) =>  Object.prototype.toString.call(v) === '[object String]'
// const isNumber = (v) =>  Object.prototype.toString.call(v) === '[object Number]'
// const isDate = (v) =>  Object.prototype.toString.call(v) === '[object Date]'
const isObject = (v) => Object.prototype.toString.call(v) === '[object Object]'
const isArray = (v) => Object.prototype.toString.call(v) === '[object Array]'
const isStringFilled = (v) =>  isString(v) && v.length > 0
