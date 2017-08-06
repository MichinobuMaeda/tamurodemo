/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import FontIcon from 'material-ui/FontIcon'
import { teal600 } from 'material-ui/styles/colors'

import { sortedGroups, getCurrentPage } from '../helper'
import { PAGE } from '../constants'

const PageNav = ({ prim, page, groups, onGroupSelected, onPageBack, onPageForward }) => (
  <div>
    <div style={{float: "right"}}>
      <IconButton
        onTouchTap={onPageBack}
        disabled={page.curr < 1}
      >
        <FontIcon className="material-icons">arrow_back</FontIcon>
      </IconButton>
      <IconButton
        onTouchTap={onPageForward}
        disabled={page.history.length - 1 <= page.curr}
      >
        <FontIcon className="material-icons">arrow_forward</FontIcon>
      </IconButton>
    </div>
    <div>
      {
        sortedGroups(prim, groups)
          .filter(g => -1 < (getCurrentPage(page).name === PAGE.USER ? g.uids : g.gids).indexOf(getCurrentPage(page).id))
          .map(g => <FlatButton
            label={g.name}
            icon={<FontIcon className="material-icons" color={teal600}>group</FontIcon>}
            onTouchTap={onGroupSelected(g._id)}
          />)
      }
    </div>
    <div style={{clear: "both"}} />
  </div>
)

export default PageNav;
