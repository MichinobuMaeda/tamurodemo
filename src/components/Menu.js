/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon'
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

const Menu = ({
  title, primary,
  onHomePageSelected, onHelpPageSelected, onSignOut
}) => (
  <div>
    <AppBar
      title={title}
      iconElementLeft={
        <IconButton
          onTouchTap={onHomePageSelected}
        >
          <FontIcon className="material-icons">home</FontIcon>
        </IconButton>
      }
      iconElementRight={
        primary
          ? <IconMenu
              iconButtonElement={
                <IconButton>
                  <FontIcon className="material-icons">menu</FontIcon>
                </IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
              <MenuItem primaryText="ヘルプ"
                onTouchTap={onHelpPageSelected}
              />
              <MenuItem primaryText="ログアウト"
                onTouchTap={onSignOut}
              />
            </IconMenu>
          : <IconButton
              onTouchTap={onHelpPageSelected}
            >
              <FontIcon className="material-icons">help</FontIcon>
            </IconButton>
      }
    />
  </div>
)

export default Menu;
