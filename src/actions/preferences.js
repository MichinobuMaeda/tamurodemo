/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import {ERRORS} from '../constants'
import {respondError} from '../helper'
import {PREFERENCE} from '../constants'

export const getHelps = async (ctx) => {
  let {Preference} = ctx.models
  let {session} = ctx
  let Preferences = (await Preference.findAll({}))
    .map(h => h.get({plain: true}))
  return Preferences.filter(h => h.pid === PREFERENCE.HELP_GUEST)
    .concat(session && session.uid
      ? Preferences.filter(h => h.pid === PREFERENCE.HELP_MEMBER) : [])
    .concat(session && ( session.isManager || session.isAdmin )
      ? Preferences.filter(h => h.pid === PREFERENCE.HELP_MANAGER) : [])
    .concat(session && session.isAdmin
      ? Preferences.filter(h => h.pid === PREFERENCE.HELP_ADMIN) : [])
}

const updatePreference = async (Preference, pid, ver, val) => {
  ver = parseInt(ver, 10)
  let [hit, updated] = await Preference.update({
    val,
    ver: ver + 1,
  }, {
    fields: ['val', 'ver'],
    where: {pid, ver},
    returning: true,
  })
  return (hit === 1)
    ? updated[0].get({plain: true})
    : respondError(ERRORS.DATA_REVISED, {pid, ver})
}

export const updateHelp = (ctx) => {
  let {pid, ver} = ctx.request.params
  let {val} = ctx.request.body
  let {Preference} = ctx.models
  return updatePreference(Preference, pid, ver, val)
}

export const updateTitle = (ctx) => {
  let {ver} = ctx.request.params
  let {val} = ctx.request.body
  let {Preference} = ctx.models
  return updatePreference(Preference, PREFERENCE.TITLE, ver, val)
}
