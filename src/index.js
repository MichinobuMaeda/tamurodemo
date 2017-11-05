/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

'use strict'

import server from './server'
import conf from '../conf'
import providers from './providers'
import {model} from './model'

Promise.resolve(model(conf))
  .then(models => server(conf, providers, models))
  .catch(e => console.error(e))
