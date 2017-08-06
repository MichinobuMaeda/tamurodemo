/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'

import ContextPageNav from '../containers/ContextPageNav'
import { paperStyle } from '../helper'

const User = ({ user }) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      <h2><FontIcon className="material-icons">person</FontIcon> { user.name }</h2>
    </Paper>
    <p style={{ "text-align": "center", margin: 32 }}><FontIcon className="material-icons">build</FontIcon> レイアウト検討中</p>
  </div>
)

export default User;
