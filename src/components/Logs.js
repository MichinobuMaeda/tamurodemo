/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import ActionList from 'material-ui/svg-icons/action/list'

import {PAPER_STYLE, ICON_STYLE_H1, ICONS} from '../constants'
import {STR} from '../preferences'
import ActionIcon from './ActionIcon'

const Logs = ({logs, onClickUpdate, onClickHistory}) =>
  <div>
    <div style={{float: 'right'}} >
      <ActionIcon
        iconName={ICONS.UPDATE}
        onTouchTap={onClickUpdate}
      />
    </div>
    <Paper
      style={PAPER_STYLE} zDepth={1}>
      <h1><ActionList style={ICON_STYLE_H1} /> {STR.LOGS}</h1>
    </Paper>
    {
      logs && logs.map(log => 
        <pre key={log._id} style={{marginLeft: 4}}>
          {JSON.stringify(log, null, 2)}
        </pre>
      )
    }
    <div style={{float: 'right'}} >
      <ActionIcon
        iconName={ICONS.HISTORY}
        onTouchTap={onClickHistory}
      />
    </div>
  </div>

Logs.propTypes = {
  logs: PropTypes.array,
  onClickUpdate: PropTypes.func,
  onClickHistory: PropTypes.func,
}

export default Logs
