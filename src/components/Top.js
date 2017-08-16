/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import { List, ListItem } from 'material-ui/List'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'
import { teal600 } from 'material-ui/styles/colors'

import ContextPageNav from '../containers/ContextPageNav'
import { sortedGroups, paperStyle, populateGids } from '../helper'

const Top = ({ prim, group, groups, onGroupSelected }) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      { group && group.desc && group.desc.split(/\n|\r/).map(line => <p>{ line }</p>) }
    </Paper>
    <List>
      {
        group && sortedGroups(prim, populateGids(group.gids, groups)).map(g =>
        <ListItem
          primaryText={g.name}
          leftIcon={
            <FontIcon className="material-icons" color={teal600}>group</FontIcon>
          }
          onTouchTap={onGroupSelected(g._id)}
        />)
      }
    </List>
  </div>
)

export default Top;
