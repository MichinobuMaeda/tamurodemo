/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import { ListItem } from 'material-ui/List'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'
import { teal600 } from 'material-ui/styles/colors'

import ContextPageNav from '../containers/ContextPageNav'
import { populateGids, sortedGroups, sortByName, paperStyle } from './formatter'

const Group = ({ prim, group, groups, users, onGroupSelected, onUserSelected }) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      <h2><FontIcon className="material-icons">group</FontIcon> { group.name }</h2>
    </Paper>
    {
      sortedGroups(prim, populateGids(group.gids, groups))
      .map(g => <ListItem
        primaryText={g.name}
        leftIcon={<FontIcon className="material-icons" color={teal600}>group</FontIcon>}
        onTouchTap={onGroupSelected(g._id)}
      />)
    }
    {
      sortByName(users)
      .map(u => <ListItem
        primaryText={u.name}
        leftIcon={<FontIcon className="material-icons" color={teal600}>person</FontIcon>}
        onTouchTap={onUserSelected(u._id)}
      />)
    }
  </div>
)

export default Group;
