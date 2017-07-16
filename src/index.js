'use strict'

/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import conf from '../conf'
import Api from './api'
const api = new Api(conf)
api.init()
