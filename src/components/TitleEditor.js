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

import {PAPER_STYLE, ICONS, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'
import ActionIcon from './ActionIcon'

const TitleEditor = ({
  title, onTextChange, onClickCommit, onClickCancel
}) => (
  <div>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <h1><EditorModeEdit style={ICON_STYLE_H1} /> {STR.TITLE}</h1>
      <TextField
        value={title.val  }
        fullWidth={true}
        onChange={onTextChange}
        floatingLabelText={STR.TITLE_HINT}
      />
      <div style={{textAlign: 'center'}}>
        <ActionIcon
          iconName={ICONS.CONFIRM}
          disabled={!title.edited || !title.val} 
          onTouchTap={title.edited && onClickCommit}
        />
        <ActionIcon
          iconName={ICONS.CANCEL}
          onTouchTap={onClickCancel}
        />
      </div>
    </Paper>
  </div>
)

TitleEditor.propTypes = {
  title: PropTypes.object,
  onTextChange: PropTypes.func,
  onClickCommit: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default TitleEditor
