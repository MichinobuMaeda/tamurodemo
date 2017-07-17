'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

export default class Template {
 
  static setupHtml({ errors, path, top, admin, manager, name, authId } = {}) {
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
}
