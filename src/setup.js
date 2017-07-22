'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import shortid from 'shortid'
import { isStringFilled, digestPassword } from './helper'

export default class Setup {
 
  static setupHtml(path, errors, { top, admin, manager, name, authId } = {}) {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Tamuro</title>
    <style>
      th { text-align: right; }
      pre.errors { color: red; }
    </style>
  </head>
  <body>
    <h1>Setup</h1>
    <pre class="errors">${ errors || ''}</pre>
    <form method="POST" action="${path || ''}">
      <table>
        <tr>
          <th>Title of this site:</th>
          <td><input type="text" id="top" name="top" value="${top || ''}"></td>
        </tr>
        <tr>
          <th>Name of the system administrators group:</th>
          <td><input type="text" id="admin" name="admin" value="${admin || ''}"></td>
        </tr>
        <tr>
          <th>Name of the account managers group:</th>
          <td><input type="text" id="manager" name="manager" value="${manager || ''}"></td>
        </tr>
        <tr>
          <th>Your name:</th>
          <td><input type="text" id="name" name="name" value="${name || ''}"></td>
        </tr>
        <tr>
          <th>Your ID:</th>
          <td><input type="text" id="authId" name="authId" value="${authId || ''}"></td>
        </tr>
        <tr>
          <th>Your password:</th>
          <td><input type="password" id="password" name="password"></td>
        </tr>
        <tr>
          <th>type password again:</th>
          <td><input type="password" id="confirm" name="confirm"></td>
        </tr>
        <tr>
          <th></th>
          <td>
            <input type="reset" value="RESET">
            <input type="submit" value="OK">
          </td>
        </tr>
    </form>
  </body>
</html>
`
  }

  static completeHtml() {
    return`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Tamuro</title>
    <style>
      th { text-align: right; }
    </style>
  </head>
  <body>
    <h1>Successfully setup completed</h1>
  </body>
</html>
`
  }

  static validateObjects(req) {
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

  static async saveObjects(st, conf, req) {
    let { top, admin, manager, name, authId, password } = req
    let ts = new Date()
    let user = await st.users.validate({
      name: name, createdAt: ts
    }, false)
    await st.users.save(user)
    let cred = await st.creds.validate({
      uid: user._id,
      provider: 'password',
      authId: authId,
      password: digestPassword(user._id, password, conf.seed),
      createdAt: ts,
    }, false)
    await st.creds.save(cred)
    let groupA = await st.groups.validate({
      name: admin,
      uids: [user._id],
      createdAt: ts,
    }, false)
    await st.groups.save(groupA)
    let groupM = await st.groups.validate({
      name: manager,
      uids: [user._id],
      createdAt: ts,
    }, false)
    await st.groups.save(groupM)
    let groupT = await st.groups.validate({
      name: top,
      gids: [groupA._id, groupM._id],
      createdAt: ts,
    }, false)
    await st.groups.save(groupT)
    let prim = {
      _id: shortid.generate(),
      ver: 0,
      top: groupT._id,
      admin: groupA._id,
      manager: groupM._id,
      createdAt: ts,
    }
    await st.prims.save(prim)
    return prim
  }
}
