/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import EditorModeEdit from 'material-ui/svg-icons/editor/mode-edit'
import {List, ListItem} from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'

import {PAPER_STYLE, PAGE, ICONS, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'
import ActionIcon from './ActionIcon'

const TITLE_PREFIX = {}
TITLE_PREFIX[PAGE.GROUP_EDITOR_OWNER] = STR.GROUP_OWNER
TITLE_PREFIX[PAGE.GROUP_EDITOR_MEMBER] = STR.MEMBER

const UserListEditor = ({
  name, users, uids, edited, page,
  onUserToggle, onClickCommit, onClickCancel
}) => (
  <div>
    <Paper
      style={PAPER_STYLE} zDepth={1}>
      <h1><EditorModeEdit style={ICON_STYLE_H1} /> {name}</h1>
    </Paper>
    <h3 style={PAPER_STYLE}>{TITLE_PREFIX[page.name]}</h3>
    <List>
      {
        users.map(u => 
          <ListItem
            leftCheckbox={
              <Checkbox
                checked={-1 < uids.indexOf(u._id)}
                onCheck={onUserToggle(page, u, 0 > uids.indexOf(u._id))}
              />
            }
            key={u._id}
            primaryText={u.name}
          />
        )
      }
    </List>
    <div style={{textAlign: 'center'}}>
      <ActionIcon
        iconName={ICONS.CONFIRM}
        disabled={!edited} 
        onTouchTap={edited && onClickCommit(page)}
      />
      <ActionIcon
        iconName={ICONS.CANCEL}
        onTouchTap={onClickCancel(page)}
      />
    </div>
  </div>
)

UserListEditor.propTypes = {
  name: PropTypes.string,
  users: PropTypes.array,
  uids: PropTypes.array,
  edited: PropTypes.bool,
  page: PropTypes.object,
  onUserToggle: PropTypes.func,
  onClickCommit: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default UserListEditor
