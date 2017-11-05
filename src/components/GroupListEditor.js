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
TITLE_PREFIX[PAGE.USER_EDITOR_GROUP] = STR.GROUP_OF_USER
TITLE_PREFIX[PAGE.GROUP_EDITOR_GROUP] = STR.UPPER_GROUP
TITLE_PREFIX[PAGE.GROUP_EDITOR_SUBGROUP] = STR.LOWER_GROUP

const GroupListEditor = ({
  name, groups, gids, edited, page,
  onGroupToggle, onClickCommit, onClickCancel
}) => (
  <div>
    <Paper
      style={PAPER_STYLE} zDepth={1}>
      <h1><EditorModeEdit style={ICON_STYLE_H1} /> {name}</h1>
    </Paper>
    <h3 style={PAPER_STYLE}>{TITLE_PREFIX[page.name]}</h3>
    <List>
      {
        groups.map(g => 
          <ListItem
            leftCheckbox={
              <Checkbox
                checked={-1 < gids.indexOf(g._id)}
                onCheck={
                  (
                    page.name === PAGE.GROUP_EDITOR_SUBGROUP ||
                    gids.length + (0 > gids.indexOf(g._id) ? 1 : -1)
                  ) &&
                  onGroupToggle(page, g, 0 > gids.indexOf(g._id))
                }
              />
            }
            key={g._id}
            primaryText={g.name}
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

GroupListEditor.propTypes = {
  name: PropTypes.string,
  groups: PropTypes.array,
  gids: PropTypes.array,
  edited: PropTypes.bool,
  page: PropTypes.object,
  onGroupToggle: PropTypes.func,
  onClickCommit: PropTypes.func,
  onClickCancel: PropTypes.func,
}

export default GroupListEditor
