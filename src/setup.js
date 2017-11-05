/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import shortid from 'shortid'
import {GROUP_ROLE, PROVIDER, PREFERENCE} from './constants'
import {model} from './model'
import conf from '../conf'

const setup = async conf => {

  const models = await model(conf)
  const {db, Group, User, Cert, Session, Log, Preference} = models

  await Group.destroy({truncate: true, cascade: true})
  await User.destroy({truncate: true, cascade: true})
  await Cert.destroy({truncate: true, cascade: true})
  await Session.destroy({truncate: true, cascade: true})
  await Log.destroy({truncate: true, cascade: true})
  await Preference.destroy({truncate: true, cascade: true})
  
  let top = await Group.create({
    _id: shortid.generate(),
    name: 'Top Group',
    role: GROUP_ROLE.TOP,
  })
  console.warn(top.get({plain: true}))

  let manager = await top.createSubGroup({
    _id: shortid.generate(),
    name: 'User Manager',
    role: GROUP_ROLE.MANAGER,
  })
  console.warn(manager.get({plain: true}))

  let admin = await top.createSubGroup({
    _id: shortid.generate(),
    name: 'System Administrator',
    role: GROUP_ROLE.ADMIN,
  })
  console.warn(admin.get({plain: true}))
  
  let user = await manager.createUser({
    _id: shortid.generate(),
    name: 'Primary User',
  })
  await admin.addUser(user)
  console.warn(user.get({plain: true}))

  let title = await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.TITLE,
    val: 'Tamuro',
  })
  console.warn(title.get({plain: true}))

  let helpForGuest = await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_GUEST,
    val: 'Help for guests',
  })
  console.warn(helpForGuest.get({plain: true}))

  let helpForMember = await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_MEMBER,
    val: 'Help for members',
  })
  console.warn(helpForMember.get({plain: true}))

  let helpForManager = await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_MANAGER,
    val: 'Help for user managers',
  })
  console.warn(helpForManager.get({plain: true}))
  
  let helpForAdmin = await Preference.create({
    _id: shortid.generate(),
    pid: PREFERENCE.HELP_ADMIN,
    val: 'Help for system administrators',
  })
  console.warn(helpForAdmin.get({plain: true}))
    
  let sess = await Session.create({
    _id: shortid.generate(),
    uid: user._id,
    provider: PROVIDER.TOKEN,
    gids: [],
    oids: [],
    isAdmin: false,
    isManager: false,
  })
  console.warn(sess.get({plain: true}))
  console.warn(`\n${process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : conf.appUrl.replace(/\/$/, '')}${conf.basePath}/token/${sess._id}\n`)
  
  await db.close()
}

Promise.resolve(setup(conf))
  .catch(e => console.error(e))
