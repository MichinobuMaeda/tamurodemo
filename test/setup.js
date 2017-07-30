'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const querystring = require('querystring')
const rp = require('request-promise')
const client = rp.defaults({
  resolveWithFullResponse: true,
  simple: false,
})

const uri = 'http://localhost:3001/api/setup'

Promise.resolve(
  client({
    method: 'POST',
    uri,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: querystring.stringify({
      top: 'Sample 3',
      admin: 'Admin Group',
      manager: 'Manager+Group',
      name: 'User 1',
      authId: 'user1id',
      password: 'user1pass',
      confirm: 'user1pass',
    })
  })
  .then(() => client(uri))
  .then(res => console.info(res.body.match('<h1>(.*)</h1>')[1]))
)
