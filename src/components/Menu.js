/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import {teal600} from 'material-ui/styles/colors'
import ActionAccountBox from 'material-ui/svg-icons/action/account-box'
import ActionAccountCircle from 'material-ui/svg-icons/action/account-circle'
import ActionAssignment from 'material-ui/svg-icons/action/assignment'
import ActionBuild from 'material-ui/svg-icons/action/build'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionPowerSettingsNew from 'material-ui/svg-icons/action/power-settings-new'
import ActionSupervisorAccount from 'material-ui/svg-icons/action/supervisor-account'
import ActionVerifiedUser from 'material-ui/svg-icons/action/verified-user'
import SocialPersonOutline from 'material-ui/svg-icons/social/person-outline'

import {
  PAGE, ICON_STYLE, ICON_BUTTON_STYLE, ICONS
} from '../constants'
import {STR, BG_COLOR} from '../preferences'
import {isBackPage, isForwardPage, currentPage} from '../actions/pages'
import ActionIcon from './ActionIcon'

const isTopPage = pages => -1 < [
  PAGE.TOP, PAGE.GOODBYE, PAGE.GUEST, PAGE.WELCOME,
].indexOf(currentPage(pages).name)

const Menu = ({
  status, pages, editable, removable, traversable, atEditorPage,
  onClickHome, onClickPageBack, onClickPageForward, onClickHelp,
  onClickSignInMethod, onClickProfile, onClickEditMode, onClickDelete,
  onClickRevokeManager, onClickRevokeAdmin,
  onClickSignOut, onClickInvitees, onClickSessions, onClickLogs, onClickDebug
}) => (
  <Toolbar
    style={{
      background: teal600,
      position: 'fixed',
      width: '100%',
      maxWidth: 1024,
      top: status.scroll.menuOffset,
    }}
  >
    <ToolbarGroup firstChild={true}>
      <ActionIcon
        iconName={ICONS.HOME}
        onTouchTap={!isTopPage(pages) && !atEditorPage && onClickHome}
        disabled={atEditorPage}
        reverse={!isTopPage(pages)}
      />
      {
        editable &&
        <ActionIcon
          iconName={ICONS.EDIT}
          onTouchTap={onClickEditMode(!status.editMode)}
          reverse={!status.editMode}
        />
      }
      {
        status.editMode && removable &&
        <ActionIcon
          iconName={ICONS.DELETE}
          onTouchTap={onClickDelete(currentPage(pages))}
          reverse={true}
        />
      }
    </ToolbarGroup>
    <ToolbarGroup lastChild={true}>
      {
        process.env.NODE_ENV === 'development' &&
        <ActionIcon
          iconName={ICONS.DEBUG}
          onTouchTap={currentPage(pages).name === PAGE.DEBUG ? onClickPageBack : onClickDebug}
          reverse={currentPage(pages).name !== PAGE.DEBUG}
        />
      }
      <ActionIcon
        iconName={ICONS.GO_BACK}
        onTouchTap={isBackPage(pages) && traversable && onClickPageBack}
        disabled={!isBackPage(pages) || !traversable}
        reverse={true}
      />
      <ActionIcon
        iconName={ICONS.GO_FORWARD}
        onTouchTap={isForwardPage(pages) && traversable && onClickPageForward}
        disabled={!isForwardPage(pages) || !traversable}
        reverse={true}
      />
      <ActionIcon
        iconName={ICONS.HELP}
        onTouchTap={
          !atEditorPage && (
            currentPage(pages).name === PAGE.HELP ? onClickPageBack : onClickHelp
          )
        }
        disabled={atEditorPage}
        reverse={currentPage(pages).name !== PAGE.HELP}
      />
      {
        status.session && status.session.uid &&
        <IconMenu
          iconButtonElement={
            <IconButton
              iconStyle={ICON_STYLE}
              style={ICON_BUTTON_STYLE}
            >
              <ActionAccountBox color={BG_COLOR} />
            </IconButton>
          }
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        >
          {
            <MenuItem
              leftIcon={<ActionVerifiedUser />}
              primaryText={STR.SIGN_IN_METHOD}
              onTouchTap={!atEditorPage && onClickSignInMethod(status.session.uid)}
              disabled={atEditorPage}
            />
          }
          {
            <MenuItem
              leftIcon={<ActionAccountCircle />}
              primaryText={STR.PROFILE}
              onTouchTap={!atEditorPage && onClickProfile(status.session.uid)}
              disabled={atEditorPage}
            />
          }
          {
            status.session && status.session.isManager && 
            <MenuItem
              leftIcon={<ActionSupervisorAccount />}
              primaryText={STR.REVOKE_MANGER}
              onTouchTap={onClickRevokeManager}
            />
          }
          {
            status.session && status.session.isAdmin &&
            <MenuItem
              leftIcon={<ActionBuild />}
              primaryText={STR.REVOKE_ADMIN}
              onTouchTap={onClickRevokeAdmin}
            />
          }
          {
            status.session && status.session.uid && 
            <MenuItem
              leftIcon={<ActionPowerSettingsNew />}
              primaryText={STR.SIGN_OUT}
              onTouchTap={onClickSignOut}
            />
          }
          {
            status.session && status.session.isAdmin &&
            <Divider />
          }
          {
            status.session && status.session.isAdmin &&
            <MenuItem
              leftIcon={<SocialPersonOutline />}
              primaryText={STR.INVITEE}
              onTouchTap={onClickInvitees}
            />
          }
          {
            status.session && status.session.isAdmin &&
            <MenuItem
              leftIcon={<ActionAssignment />}
              primaryText={STR.SESSIONS}
              onTouchTap={onClickSessions}
            />
          }
          {
            status.session && status.session.isAdmin &&
            <MenuItem
              leftIcon={<ActionList />}
              primaryText={STR.LOGS}
              onTouchTap={onClickLogs}
            />
          }
        </IconMenu>
      }
    </ToolbarGroup>
  </Toolbar>
)

Menu.propTypes = {
  status: PropTypes.object,
  pages: PropTypes.object,
  editable: PropTypes.bool,
  removable: PropTypes.bool,
  atEditorPage: PropTypes.bool,
  traversable: PropTypes.bool,
  onClickHome: PropTypes.func,
  onClickPageBack: PropTypes.func,
  onClickPageForward: PropTypes.func,
  onClickHelp: PropTypes.func,
  onClickSignInMethod: PropTypes.func,
  onClickProfile: PropTypes.func,
  onClickEditMode: PropTypes.func,
  onClickDelete: PropTypes.func,
  onClickRevokeManager: PropTypes.func,
  onClickRevokeAdmin: PropTypes.func, 
  onClickSignOut: PropTypes.func,
  onClickInvitees: PropTypes.func,
  onClickSessions: PropTypes.func,
  onClickLogs: PropTypes.func,
  onClickDebug: PropTypes.func,
}

export default Menu
