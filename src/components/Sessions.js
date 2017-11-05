/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import ActionAssignment from 'material-ui/svg-icons/action/assignment'

import {PAPER_STYLE, ICON_STYLE_H1, ICONS} from '../constants'
import {STR} from '../preferences'
import ConfirmDialogContainer from '../containers/ConfirmDialogContainer'
import ActionIcon from './ActionIcon'

const Sessions = ({sessions, onClickUpdate, onClickHistory, onClickDelete}) =>
  <div>
    <div style={{float: 'right'}} >
      <ActionIcon
        iconName={ICONS.UPDATE}
        onTouchTap={onClickUpdate}
      />
    </div>
    <Paper
      style={PAPER_STYLE} zDepth={1}>
      <h1><ActionAssignment style={ICON_STYLE_H1} /> {STR.SESSIONS}</h1>
    </Paper>
    {
      sessions && sessions.map(sess =>
        <div key={sess._id} style={{clear: 'both'}}>
          <div style={{float: 'left'}} >
            <ActionIcon
              iconName={ICONS.DELETE}
              onTouchTap={onClickDelete(sess._id)}
            />
          </div>
          <pre style={{marginLeft: 48}}>
            {JSON.stringify(sess, null, 2)}
          </pre>
        </div>
      )
    }
    <div style={{float: 'right'}} >
      <ActionIcon
        iconName={ICONS.HISTORY}
        onTouchTap={onClickHistory}
      />
    </div>
    <ConfirmDialogContainer />
  </div>

Sessions.propTypes = {
  sessions: PropTypes.array,
  onClickUpdate: PropTypes.func,
  onClickHistory: PropTypes.func,
  onClickDelete: PropTypes.func,
}

export default Sessions
