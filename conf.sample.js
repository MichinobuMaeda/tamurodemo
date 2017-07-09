'use strict';

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const mongodb = "mongodb://127.0.0.1:27017/tamuro_api"
const prefix = "/api"
const port = "3000"
const appKey = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const seed = "01234567890123456789012345678901234567890123456789"
const expires = (10 * 24 * 60 * 60 * 1000)

module.exports = {
  mongodb,
  prefix,
  port,
  appKey,
  seed,
  expires,
}
