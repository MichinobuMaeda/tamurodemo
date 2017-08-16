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
import Divider from 'material-ui/Divider'

import { PRIV, PAGE } from '../constants'
import { nameOfPrivilege, getCurrentPage } from '../helper'

const Menu = ({
  title, prim, sess, page,
  onHomePageSelected, onHelpPageSelected, onSignOut, onHelpPageClosed,
  onPrivManagerSelected, onPrivAdminSelected, onPrivUserSelected,
  onLogsSelected, onSessionsSelected, onProviderPageSelected,
  onAddGroup, onEditGroup, onAddUser, onEditUser
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
        prim
          ? getCurrentPage(page).name === PAGE.HELP
            ? <IconButton
                onTouchTap={onHelpPageClosed}
              >
                <FontIcon className="material-icons">highlight_off</FontIcon>
              </IconButton>
            : <IconMenu
                iconButtonElement={
                  <IconButton>
                    <FontIcon className="material-icons">menu</FontIcon>
                  </IconButton>
                }
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}
              >
                <MenuItem
                  primaryText="ヘルプ"
                  onTouchTap={onHelpPageSelected}
                />
                <MenuItem
                  primaryText="ログアウト"
                  onTouchTap={onSignOut}
                />
                <MenuItem
                  primaryText="ログイン方法"
                  onTouchTap={onProviderPageSelected(sess.uid)}
                />
                <Divider />
                {
                  sess.manager &&
                  <MenuItem
                    primaryText={nameOfPrivilege[PRIV.MANAGER]}
                    onTouchTap={onPrivManagerSelected}
                    disabled={sess.priv === PRIV.MANAGER}
                  />
                }
                {
                  sess.admin &&
                  <MenuItem
                    primaryText={nameOfPrivilege[PRIV.ADMIN]}
                    onTouchTap={onPrivAdminSelected}
                    disabled={sess.priv === PRIV.ADMIN}
                  />
                }
                {
                  (sess.manager || sess.admin) &&
                  <MenuItem
                    primaryText={nameOfPrivilege[PRIV.USER]}
                    onTouchTap={onPrivUserSelected}
                    disabled={sess.priv === PRIV.USER}
                  />
                }
                <Divider />
                {
                  (
                    getCurrentPage(page).name === PAGE.GROUP ||
                    getCurrentPage(page).name === PAGE.TOP
                  ) && 
                  sess.manager && sess.priv === PRIV.MANAGER &&
                  <MenuItem
                    primaryText={"編集"}
                    onTouchTap={onEditGroup(getCurrentPage(page).id)}
                  />
                }
                {
                  getCurrentPage(page).name === PAGE.USER &&
                  (
                    (sess.manager && sess.priv === PRIV.MANAGER) ||
                    sess.uid === getCurrentPage(page).id
                  ) &&
                  <MenuItem
                    primaryText={"編集"}
                    onTouchTap={onEditUser(getCurrentPage(page).id)}
                  />
                }
                {
                  (
                    getCurrentPage(page).name === PAGE.GROUP ||
                    getCurrentPage(page).name === PAGE.TOP
                  ) &&
                  sess.manager && sess.priv === PRIV.MANAGER &&
                  <MenuItem
                    primaryText={"グループ追加"}
                    onTouchTap={onAddGroup(getCurrentPage(page).id)}
                  />
                }
                {
                  (
                    getCurrentPage(page).name === PAGE.GROUP
                  ) &&
                  sess.manager && sess.priv === PRIV.MANAGER &&
                  <MenuItem
                    primaryText={"ユーザー追加"}
                    onTouchTap={onAddUser(getCurrentPage(page).id)}
                  />
                }
                {
                  sess.admin && sess.priv === PRIV.ADMIN &&
                  <MenuItem
                    primaryText={"ログ"}
                    onTouchTap={onLogsSelected}
                  />
                }
                {
                  sess.admin && sess.priv === PRIV.ADMIN &&
                  <MenuItem
                    primaryText={"セッション"}
                    onTouchTap={onSessionsSelected}
                  />
                }
              </IconMenu>
          : getCurrentPage(page).name === PAGE.HELP
            ? <IconButton
                onTouchTap={onHelpPageClosed}
              >
                <FontIcon className="material-icons">highlight_off</FontIcon>
              </IconButton>
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
