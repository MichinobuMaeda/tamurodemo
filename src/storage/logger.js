'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import bunyan from 'bunyan'

class LogStream {
  constructor(collection) {this.collection = collection }
  write(rec) {
    let log = JSON.parse(rec)
    log.time = new Date(log.time).getTime()
    this.collection.save(log)
  }
}

const logger = (collection) => {
  return bunyan.createLogger({
    name: 'tamuro-api',
    streams: [{ stream: new LogStream(collection) }]
  })
}

export default logger
