/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import Chip from 'material-ui/Chip'
import Divider from 'material-ui/Divider'
import CommunicationContacts from 'material-ui/svg-icons/communication/contacts'
import SocialGroup from 'material-ui/svg-icons/social/group'
import SocialPerson from 'material-ui/svg-icons/social/person'
import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'

import {
  PAGE, NEW_USER_ID, PAPER_STYLE, BUTTON_STYLE, CHIP_STYLE, WRAPPER_STYLE,
  ICONS, ICON_STYLE_H1, ICON_STYLE_H3
} from '../constants'
import {STR, THEME_COLOR1, profileItems} from '../preferences'
import ActionIcon from './ActionIcon'
import {groupList} from '../actions/groups'

const User = ({
  status, user, onClickGroup, onClickReset,
  onClickEditUser, onClickEditGroupList, onClickSignInMethod,
}) => user
  ? <div>
    <div style={{clear: 'both'}}>
      {
        status.editMode && status.session && status.session.isManager &&
        <div style={PAPER_STYLE}>
          <div style={{float: 'right'}} >
            <ActionIcon
              iconName={ICONS.EDIT}
              onTouchTap={
                onClickEditGroupList({
                  name: PAGE.USER_EDITOR_GROUP,
                  id: user._id
                })
              }
            />
          </div>
          <h3 style={{color: THEME_COLOR1}}>{STR.UPPER_GROUP}</h3>
        </div>
      }
      {
        user.groups && user.groups.length
          ? <div style={WRAPPER_STYLE}>{
            groupList(user.groups).map(g => <Chip
              style={CHIP_STYLE}
              key={g._id}
              onClick={user._id !== NEW_USER_ID && onClickGroup(g._id)}
            >
              <Avatar icon={<SocialGroup />} />
              {g.name}
            </Chip>)
          }</div>
          : ''
      }
    </div>
    {
      status.session && (
        status.session.isManager || status.session.uid === user._id
      ) && status.editMode &&
      <div style={{...PAPER_STYLE, clear: 'both'}}>
        <div style={{float: 'right'}}>
          <ActionIcon
            iconName={ICONS.EDIT}
            onTouchTap={onClickSignInMethod(user._id)}
          />
        </div>
        <h3 style={{color: THEME_COLOR1}}>{STR.EDIT_SIGN_IN_METHOD}</h3>
      </div>
    }
    <Paper
      style={{...PAPER_STYLE, clear: 'both'}} zDepth={1}>
      {
        status.session && (
          status.session.isManager || status.session.uid === user._id
        ) && status.editMode &&
        <div style={{float: 'right'}}>
          <ActionIcon
            iconName={ICONS.EDIT}
            onTouchTap={onClickEditUser(user._id)}
          />
        </div>
      }
      <h1><SocialPerson style={ICON_STYLE_H1} /> {user.name}</h1>
      {user.desc && user.desc.split('\n').map((d, i) => (<p key={i}>{d}</p>))}
    </Paper>
    {
      user.profiles && user.profiles.map(p =>
        <Paper key={p.tag} style={PAPER_STYLE} zDepth={1}>
          <h3><CommunicationContacts style={ICON_STYLE_H3}/> {p.tag}</h3>
          <Divider />
          {
            profileItems.map(i => p[i.key] && p[i.key].val && <div>{p[i.key].val}</div>)
          }
        </Paper>
      )
    }
  </div>
  : <Paper style={{...PAPER_STYLE, textAlign: 'center'}} zDepth={1}>
    <p>{STR.USER_HAS_BEEN_DELETED}</p>
    <RaisedButton
      label={STR.RESET}
      primary={true}
      onTouchTap={onClickReset}
      style={BUTTON_STYLE}
    />
  </Paper>

User.propTypes = {
  status: PropTypes.object,
  user: PropTypes.array,
  onClickEditUser: PropTypes.func,
  onClickEditGroupList: PropTypes.func,
  onClickSignInMethod: PropTypes.func,
  onClickGroup: PropTypes.func,
  onClickReset: PropTypes.func,
}

export default User
