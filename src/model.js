'use strict';

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import bunyan from 'bunyan'
import bluebird from 'bluebird'

import { err, prv } from './constants'

export const mongoose = require('mongoose')
mongoose.Promise = bluebird

const Schema = mongoose.Schema;

export class LogStream {
  write(rec) {
    return Promise.resolve()
    .then(res => new Log(JSON.parse(rec)))
    .then(res => res.save())
    .then(res => res)
    .catch(e => console.error(e))
  }
}

export const log = bunyan.createLogger({
  name: "tamuro-api",
  streams: [ { stream: new LogStream() } ]
})

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true },
  profile: { type: Schema.Types.Mixed, default: {} },
}, {
  versionKey: 'ver',
  minimize: false,
})

UserSchema.statics.build = function(obj) {
  if (!isObject(obj)) return { errors: [err.required('')] }
  let errors = []
  let { name, profile } = obj
  if (!isStringRequired(name)) {
    errors.push(err.required('name'))
  }
  profile = buildObject(profile)
  if (!profile) {
    errors.push(err.object('profile'))
  }
  return errors.length ? { errors: errors } : {
    name: name,
    profile: profile,
  }
}

UserSchema.statics.validate = async function(obj) {
  let ret = User.build(obj)
  if (ret.errors) { return ret }
  let errors = []
  if (0 < (await User.count({ name: ret.name, _id: { $ne: obj._id } }))) {
    errors.push(err.unique('name'))
  }
  return errors.length ? { errors: errors } : ret
}

UserSchema.statics.create = async function(obj) {
  let ret = await User.validate(obj)
  if (ret.errors) { return ret }
  return await (new User(ret)).save()
}

UserSchema.statics.update = async function(obj) {
  let ret = await User.validate(obj)
  if (ret.errors) { return ret }
  ret.ver = obj.ver + 1
  ret = await User.findOneAndUpdate( { _id: obj._id, ver: obj.ver }, ret )
  return ret ? (await User.findById(ret._id)) : { errors: [ err.match('ver') ] }
}

UserSchema.statics.delete = async function(obj) {
  let ret = await User.findOneAndRemove( { _id: obj._id, ver: obj.ver } )
  return ret ? {} : { errors: [ err.match('ver') ] }
}

export const User = mongoose.model('User', UserSchema)

const GroupSchema = new Schema({
  name: { type: String, required: true, unique: true },
  gids: { type: Array, 'default': [] },
  uids: { type: Array, 'default': [] },
}, {
  versionKey: 'ver',
})

GroupSchema.statics.build = (obj) => {
  if (!isObject(obj)) return { errors: [err.required('')] }
  let errors = []
  let { name, gids, uids } = obj
  if (!isStringRequired(name)) {
    errors.push(err.required('name'))
  }
  gids = buildArray(gids)
  errors = gids.reduce((ret, cur, i) => {
    if (!isStringRequired(cur)) {
      errors.push(err.required(`gids.${i}`))
    }
    return ret
  }, errors)
  uids = buildArray(uids)
  errors = uids.reduce((ret, cur, i) => {
    if (!isStringRequired(cur)) {
      errors.push(err.required(`uids.${i}`))
    }
    return ret
  }, errors)
  return errors.length ? { errors: errors } : {
    name: name,
    gids: gids,
    uids: uids,
  }
}

GroupSchema.statics.validate = async function(obj) {
  let ret = Group.build(obj)
  if (ret.errors) { return ret }
  let errors = []
  if (0 < (await Group.count({ name: ret.name, _id: { $ne: obj._id } }))) {
    errors.push(err.unique('name'))
  }
  errors = await ret.gids.reduce(async (base, cur, i) => {
    if (0 == (await Group.count({ _id: cur }))) {
      base.push(err.reference(`gids.${i}`))
    }
    return base
  }, errors)
  errors = await ret.uids.reduce(async (base, cur, i) => {
    if (0 == (await User.count({ _id: cur }))) {
      base.push(err.reference(`uids.${i}`))
    }
    return base
  }, errors)
  return errors.length ? { errors: errors } : ret
}

GroupSchema.statics.create = async function(obj) {
  let ret = await Group.validate(obj)
  if (ret.errors) { return ret }
  return await (new Group(ret)).save()
}

GroupSchema.statics.update = async function(obj) {
  let ret = await Group.validate(obj)
  if (ret.errors) { return ret }
  ret.ver = obj.ver + 1
  ret = await Group.findOneAndUpdate( { _id: obj._id, ver: obj.ver }, ret )
  return ret ? (await Group.findById(ret._id)) : { errors: [ err.match('ver') ] }
}

GroupSchema.statics.delete = async function(obj) {
  let ret = await Group.findOneAndRemove( { _id: obj._id, ver: obj.ver } )
  return ret ? {} : { errors: [ err.match('ver') ] }
}

export const Group = mongoose.model('Group', GroupSchema)

const PrimSchema = new Schema({
  key:      { type: Number, required: true, default: 0, min: 0, max: 0 },
  top:      { type: String, required: true },
  admin:    { type: String, required: true },
  manager:  { type: String, required: true },
}, {
  versionKey: 'ver',
})

PrimSchema.statics.build = function(obj) {
  if (!isObject(obj)) return { errors: [err.required('')] }
  let errors = []
  let { top, admin, manager } = obj
  if (!isStringRequired(top)) {
    errors.push(err.required('top'))
  }
  if (!isStringRequired(admin)) {
    errors.push(err.required('admin'))
  }
  if (!isStringRequired(manager)) {
    errors.push(err.required('manager'))
  }
  return errors.length ? { errors: errors } : {
    top: top,
    admin: admin,
    manager: manager,
  }
}

export const Prim = mongoose.model('Prim', PrimSchema)

const CredSchema = new Schema({
  uid:     { type: String, required: true },
  provider: { type: String, required: true },
  authId:   { type: String, required: true },
  attr: Schema.Types.Mixed,
}, {
  versionKey: 'ver',
})

CredSchema.index({ uid: 1, provider: 1 }, { unique: true })

CredSchema.index({ provider: 1, authId: 1 }, { unique: true })

CredSchema.statics.build = function(obj) {
  if (!isObject(obj)) return { errors: [err.required('')] }
  let errors = []
  let { uid, provider, authId, attr } = obj
  if (!isStringRequired(uid)) {
    errors.push(err.required('uid'))
  }
  if (!isStringRequired(provider)) {
    errors.push(err.required('provider'))
  } else {
    attr = (!attr) ? {} : (!isObject(attr) ? {} : attr)
    if (!prv[provider]) {
      errors.push(err.provider('provider'))
    }
    if (provider == prv.password && !isStringRequired(attr.password)) {
      errors.push(err.required('attr.password'))
    }
  }
  if (!isStringRequired(authId)) {
    errors.push(err.required('authId'))
  }
  return errors.length ? { errors: errors } : {
    uid: uid,
    provider: provider,
    authId: authId,
    attr: attr,
  }
}

CredSchema.statics.validate = async function(obj) {
  let ret = Cred.build(obj)
  if (ret.errors) { return ret }
  let errors = []
  if (0 == (await User.count({ _id: obj.uid }))) {
    errors.push(err.reference('uid'))
  } else if (0 < (await Cred.count({
      provider: obj.provider,
      authId: obj.authId,
      uid: { $ne: obj.uid }
    }))) {
    errors.push(err.unique('authId'))
  }
  return errors.length ? { errors: errors } : ret
}

CredSchema.statics.create = async function(obj) {
  let ret = await Cred.validate(obj)
  if (ret.errors) { return ret }
  return await (new Cred(ret)).save()
}

CredSchema.statics.update = async function(obj) {
  let ret = await Cred.validate(obj)
  if (ret.errors) { return ret }
  ret.ver = obj.ver + 1
  ret = await Cred.findOneAndUpdate({
    uid: obj.uid,
    provider: obj.provider,
    ver: obj.ver,
  }, ret)
  return ret ? (await Cred.findById(ret._id)) : { errors: [ err.match('ver') ] }
}

CredSchema.statics.delete = async function(obj) {
  let ret = await Cred.findOneAndRemove({
    uid: obj.uid,
    provider: obj.provider,
    ver: obj.ver,
  })
  return ret ? {} : { errors: [ err.match('ver') ] }
}

export const Cred =  mongoose.model('Cred', CredSchema)

const SessionSchema = new Schema({
  uid:      { type: String, require: true },
  provider: { type: String, require: true },
  gids:     { type: Array, 'default': [] },
  admin:    { type: Boolean, 'default': false },
  manager:  { type: Boolean, 'default': false },
  createdAt:{ type: Date, index: true },
}, {
  versionKey: 'ver',
  minimize: false,
})

SessionSchema.statics.build = async function(obj) {
  if (!isObject(obj)) return { errors: [err.required('')] }
  let { uid, provider } = obj
  let errors = []
  if (!isStringRequired(uid)) {
    errors.push(err.string('uid'))
  }
  if (!isStringRequired(provider)) {
    errors.push(err.string('provider'))
  }
  let prim = await Prim.findOne({}).exec()
  let gids = await getGroups(uid)
  return errors.length ? { errors: errors } : {
    uid: uid,
    provider: provider,
    gids: gids,
    admin: (gids.indexOf(prim.admin) > -1),
    manager: (gids.indexOf(prim.manager) > -1),
    createdAt: new Date(),
  }
}

SessionSchema.statics.validate = async function(obj) {
  let ret = await Session.build(obj)
  if (ret.errors) { return ret }
  let errors = []
  if (0 == (await User.count({ _id: obj.uid }))) {
    errors.push(err.reference('uid'))
  }
  if (0 == (await Cred.count({ uid: obj.uid, provider: obj.provider }))) {
    errors.push(err.reference('provider'))
  }
  return errors.length ? { errors: errors } : ret
}

SessionSchema.statics.create = async function(obj) {
  let ret = await Session.validate(obj)
  if (ret.errors) { return ret }
  return await (new Session(ret)).save()
}

SessionSchema.statics.delete = async function(sid) {
  let ret = await Session.findByIdAndRemove(sid)
  return ret ? {} : { errors: [ err.reference('') ] }
}

export const Session = mongoose.model('Session', SessionSchema)

export async function getGroups(id) {
  let ret = []
  if (!id) { return ret }
  let gids = []
  if (Object.prototype.toString.call(id) !== '[object Array]') {
    gids = (await Group.find({ uids: id.toString() }).exec())
  } else {
    ret = ret.concat(id)
    gids = await Group.find({ gids: { $in: id }}).exec()
  }
  gids = gids.map(g => g._id.toString()).filter(v => ret.indexOf(v) < 0)
  return gids.length == 0 ? ret : getGroups(ret.concat(gids))
}

export const Log = mongoose.model('Log', new Schema({
  name: String,
  hostname: String,
  pid: Number,
  level: Number,
  msg: String,
  attr: Schema.Types.Mixed,
  time: { type: Date, index: true },
  v: Number,
}, {
  versionKey: 'ver',
}))

export function buildNumber(v) {
  if (isNumber(v)) { return v }
  if (!isStringRequired(v)) { return null }
  let ret = Number(v)
  return isNaN(ret) ? null : ret
}

export function buildDate(v) {
  if (isDate(v)) { return v }
  if (!isStringRequired(v)) { return null }
  let ret = new Date(v)
  return isNaN(ret.getTime()) ? null : ret
}

export function buildArray(v) {
  return isArray(v) ? v : ((isUndefined(v) || isNull(v)) ? [] : [v])
}

export function buildObject(v) {
  return isObject(v) ? v : ((isUndefined(v) || isNull(v)) ? {} : null)
}

export function isStringRequired(v) {
  return isString(v) && v.length > 0
}

export function isStringOptional(v) {
  return isUndefined(v) || isNull(v) || isString(v)
}

export function isNumberOptional(v) {
  return isUndefined(v) || isNull(v) || isNumber(v)
}

export function isDateOptional(v) {
  return isUndefined(v) || isNull(v) || isDate(v)
}

export function isUndefined(v) {
  return Object.prototype.toString.call(v) === '[object Undefined]'
}

export function isNull(v) {
  return Object.prototype.toString.call(v) === '[object Null]'
}

export function isString(v) {
  return Object.prototype.toString.call(v) === '[object String]'
}

export function isNumber(v) {
  return Object.prototype.toString.call(v) === '[object Number]'
}

export function isDate(v) {
  return Object.prototype.toString.call(v) === '[object Date]'
}

export function isObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]'
}

export function isArray(v) {
  return Object.prototype.toString.call(v) === '[object Array]'
}
