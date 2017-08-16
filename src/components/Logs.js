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

const excludes = ["_id", "name", "hostname", "pid", "time", "level", "v"]

const Logs = ({ logs, onRefreshLogs, onGetMoreLogs }) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      <IconButton
        onTouchTap={onRefreshLogs}
        style={{ float: "right" }}
      >
        <FontIcon className="material-icons">refresh</FontIcon>
      </IconButton>
      <h2><FontIcon className="material-icons">search</FontIcon> ログ</h2>
      <div>{ `${new Date(logs.f).toLocaleString()} -> ${new Date(logs.t).toLocaleString()}` }</div>
      <div>{ `[ get: ${logs.logs.length} / all: ${logs.cnt} ]` }</div>
    </Paper>
    <div style={{ margin: "8px", fontFamily: "monospace", clear: "both"}}>
      {logs.logs.map(log => 
        <div>{`${new Date(log.time).toISOString()}:${log.level}:${
            Object.keys(log).reduce((ret, cur) => 0 > excludes.indexOf(cur) && log[cur]
              ? ret.concat(`${cur}:${JSON.stringify(log[cur])}`) : ret, []).join(", ")
          }`}</div>
      )}
    </div>
    <IconButton
      onTouchTap={onGetMoreLogs}
      style={{ float: "right" }}
    >
      <FontIcon className="material-icons">expand_more</FontIcon>
    </IconButton>
  </div>
)

export default Logs;
