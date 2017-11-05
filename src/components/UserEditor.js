/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'

import {PAPER_STYLE, NEW_USER_ID, ICONS, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'
import ActionIcon from './ActionIcon'

const UserEditor = ({
  user, onNameChange, onDescChange, onClickCommit, onClickCancel
}) => (
  <div>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <h1><EditorModeEdit style={ICON_STYLE_H1} /> {
        user._id === NEW_USER_ID ? STR.NEW_USER : STR.USER}</h1>
      <TextField
        value={user.name}
        fullWidth={true}
        onChange={onNameChange(user._id)}
        floatingLabelText={STR.USER_NAME_HINT}
      />
      <br/>
      <TextField
        value={user.desc  }
        fullWidth={true}
        multiLine={true}
        rows={3}
        onChange={onDescChange(user._id)}
        floatingLabelText={STR.USER_DESC}
      />
      <div style={{textAlign: 'center'}}>
        <ActionIcon
          iconName={ICONS.CONFIRM}
          disabled={!user.edited || !user.name} 
          onTouchTap={user.edited && onClickCommit(user._id)}
        />
        <ActionIcon
          iconName={ICONS.CANCEL}
          onTouchTap={onClickCancel(user._id)}
        />
      </div>
    </Paper>
  </div>
)

UserEditor.propTypes = {
  user: PropTypes.object,
  onNameChange: PropTypes.func,
  onDescChange: PropTypes.func,
  onClickCommit: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default UserEditor
