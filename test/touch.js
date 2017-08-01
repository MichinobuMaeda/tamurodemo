'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const rp = require('request-promise')
const client = rp.defaults({
  resolveWithFullResponse: true,
  simple: false,
})

const uri = 'http://localhost:3001/api/setup'

Promise.resolve(
  client({
    method: 'GET',
    uri,
  })
  .then(() => client(uri))
  .then(res => console.info(res.body.match('<h1>(.*)</h1>')[1]))
)
