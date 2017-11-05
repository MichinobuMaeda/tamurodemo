/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import {List, ListItem} from 'material-ui/List'
import ActionHome from 'material-ui/svg-icons/action/home'
import SocialGroup from 'material-ui/svg-icons/social/group'

import {PAPER_STYLE, ICONS, ICON_STYLE_H1} from '../constants'
import ActionIcon from './ActionIcon'

const Top = ({status, onClickTitleEdit, onClickGroup}) => (
  <div>
    <Paper
      style={PAPER_STYLE}
      zDepth={1}
    >
      <div style={{float: 'right'}}>{
        status.editMode && status.session && status.session.isAdmin &&
        <ActionIcon
          iconName={ICONS.EDIT}
          onTouchTap={onClickTitleEdit}
        />
      }</div>
      <h1><ActionHome style={ICON_STYLE_H1} /> {status.title.val}</h1>
    </Paper>
    <List>
      <ListItem
        primaryText={status.top.name}
        leftIcon={<SocialGroup />}
        onClick={onClickGroup(status.top._id)}
      />
    </List>
  </div>
)

Top.propTypes = {
  status: PropTypes.object,
  onClickTitleEdit: PropTypes.func,
  onClickGroup: PropTypes.func,
}

export default Top
