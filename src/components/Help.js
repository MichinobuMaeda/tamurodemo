/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import HelpGuest from './HelpGuest'
import HelpMember from './HelpMember'

const Help = ({prim}) => (
  <div>
    {
      !prim
        ? <HelpGuest />
        : <HelpMember />
    }
  </div>
)

export default Help;
