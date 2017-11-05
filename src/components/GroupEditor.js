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

import {PAPER_STYLE, NEW_GROUP_ID, ICONS, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'
import ActionIcon from './ActionIcon'

const GroupEditor = ({
  group, onNameChange, onDescChange, onClickCommit, onClickCancel
}) => (
  <div>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <h1><EditorModeEdit style={ICON_STYLE_H1} /> {
        group._id === NEW_GROUP_ID ? STR.NEW_GROUP : STR.GROUP}</h1>
      <TextField
        value={group.name}
        fullWidth={true}
        onChange={onNameChange(group._id)}
        floatingLabelText={STR.GROUP_NAME_HINT}
      />
      <br/>
      <TextField
        value={group.desc  }
        fullWidth={true}
        multiLine={true}
        rows={3}
        onChange={onDescChange(group._id)}
        floatingLabelText={STR.GROUP_DESC}
      />
      <div style={{textAlign: 'center'}}>
        <ActionIcon
          iconName={ICONS.CONFIRM}
          disabled={!group.edited || !group.name} 
          onTouchTap={group.edited ? onClickCommit(group._id) : null}
        />
        <ActionIcon
          iconName={ICONS.CANCEL}
          onTouchTap={onClickCancel(group._id)}
        />
      </div>
    </Paper>
  </div>
)

GroupEditor.propTypes = {
  group: PropTypes.object,
  onNameChange: PropTypes.func,
  onDescChange: PropTypes.func,
  onClickCommit: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default GroupEditor
