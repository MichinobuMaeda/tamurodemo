/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import Divider from 'material-ui/Divider'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'

import {PAPER_STYLE, ICONS, ICON_STYLE_H1} from '../constants'
import ActionIcon from './ActionIcon'

const HelpEditor = ({help, onTextChange, onClickCommit, onClickCancel}) => (
  <div>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <h1><EditorModeEdit style={ICON_STYLE_H1} /> {help.pid}</h1>
    </Paper>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <Divider/>
      <TextField
        value={help.val  }
        fullWidth={true}
        multiLine={true}
        rows={10}
        onChange={onTextChange(help.pid)}
      />
      <p style={{textAlign: 'center'}}>
        <ActionIcon
          iconName={ICONS.CONFIRM}
          disabled={!help.edited} 
          onTouchTap={help.edited && onClickCommit(help.pid)}
        />
        <ActionIcon
          iconName={ICONS.CANCEL}
          onTouchTap={onClickCancel(help.pid)}
        />
      </p>
    </Paper>
  </div>
)

HelpEditor.propTypes = {
  help: PropTypes.array,
  onTextChange: PropTypes.func,
  onClickCommit: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default HelpEditor
