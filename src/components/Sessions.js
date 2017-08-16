/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'

import ContextPageNav from '../containers/ContextPageNav'
import { paperStyle } from '../helper'

const Sessions = ({ sessions, onRefreshSessions }) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      <IconButton
        onTouchTap={onRefreshSessions}
        style={{ float: "right" }}
      >
        <FontIcon className="material-icons">refresh</FontIcon>
      </IconButton>
      <h2><FontIcon className="material-icons">search</FontIcon> セッション</h2>
    </Paper>
    <pre style={{ margin: "8px" }}>{ JSON.stringify(sessions, null, 4) }</pre>
  </div>
)

export default Sessions;
