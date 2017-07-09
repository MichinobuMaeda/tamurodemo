'use strict';

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import conf from '../conf.js'
import Service from './service'
const srv = new Service(conf)
srv.init()
