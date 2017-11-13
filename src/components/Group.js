/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import Chip from 'material-ui/Chip'
import {List, ListItem} from 'material-ui/List'
import SocialGroup from 'material-ui/svg-icons/social/group'
import SocialPerson from 'material-ui/svg-icons/social/person'
import Avatar from 'material-ui/Avatar'
import RaisedButton from 'material-ui/RaisedButton'

import {
  PAGE, PAPER_STYLE, BUTTON_STYLE, CHIP_STYLE, WRAPPER_STYLE,
  ICONS, ICON_STYLE_H1
} from '../constants'
import {STR, THEME_COLOR1} from '../preferences'
import ActionIcon from './ActionIcon'
import {groupList} from '../actions/groups'

const Group = ({
  status, group, onClickGroup, onClickUser, onClickReset,
  onClickEditGroup, onClickEditGroupList, onClickEditUserList,
  onClickNewGroup, onClickNewUser,
}) => group
  ? <div>
    {
      status.editMode && status.session && status.session.isManager &&
      group._id !== status.top._id &&
      <div style={{...PAPER_STYLE, clear: 'both'}}>
        <div style={{float: 'right'}} >
          <ActionIcon
            iconName={ICONS.EDIT}
            onTouchTap={onClickEditGroupList(PAGE.GROUP_EDITOR_GROUP, group._id)}
          />
        </div>
        <h3 style={{color: THEME_COLOR1}}>{STR.UPPER_GROUP}</h3>
      </div>
    }
    {
      group.groups && group.groups.length
        ? <div style={WRAPPER_STYLE}>{
          groupList(group.groups).map(g => <Chip
            style={CHIP_STYLE}
            key={g._id}
            onClick={onClickGroup(g._id)}
          >
            <Avatar icon={<SocialGroup />} />
            {g.name}
          </Chip>)
        }</div>
        : ''
    }
    {
      status.editMode && status.session && (
        status.session.isManager ||
        0 < status.session.oids.indexOf(group._id)
      ) && group._id !== status.top._id &&
      <div style={{...PAPER_STYLE, clear: 'both'}}>
        <div style={{float: 'right'}} >
          <ActionIcon
            iconName={ICONS.EDIT}
            onTouchTap={onClickEditGroupList(PAGE.GROUP_EDITOR_OWNER, group._id)}
          />
        </div>
        <h3 style={{color: THEME_COLOR1}}>{STR.GROUP_OWNER}</h3>
      </div>
    }
    {
      group.owners && group.owners.length
        ? <div style={WRAPPER_STYLE}>{
          groupList(group.owners).map(u => <Chip
            style={CHIP_STYLE}
            key={u._id}
            onClick={onClickUser(u._id)}
          >
            <Avatar icon={<SocialPerson />} />
            {u.name}
          </Chip>)
        }</div>
        : ''
    }
    <Paper
      style={{...PAPER_STYLE, clear: 'both'}} zDepth={1}>
      {
        status.session && status.session.isManager && status.editMode &&
        <div style={{float: 'right'}}>
          <ActionIcon
            iconName={ICONS.EDIT}
            onTouchTap={onClickEditGroup(group._id)}
          />
        </div>
      }
      <h1><SocialGroup style={ICON_STYLE_H1} /> {group.name}</h1>
      <div style={{clear: 'both'}}>{
        group.desc && group.desc.split('\n').map((d, i) => (<p key={i}>{d}</p>))
      }</div>
    </Paper>
    <div style={{clear: 'both'}}>
      {
        status.editMode && status.session && (
          status.session.isManager ||
          0 < status.session.oids.indexOf(group._id)
        ) &&
        <div>
          <div style={PAPER_STYLE}>
            <div style={{float: 'right'}} >
              <ActionIcon
                iconName={ICONS.NEW_GROUP}
                onTouchTap={onClickNewGroup(group)}
              />
              <ActionIcon
                iconName={ICONS.EDIT}
                onTouchTap={onClickEditGroupList(PAGE.GROUP_EDITOR_SUBGROUP, group._id)}
              />
            </div>
            <h3 style={{color: THEME_COLOR1}}>{STR.LOWER_GROUP}</h3>
          </div>
        </div>
      }
      {
        group.subGroups && group.subGroups.length
          ? <List>{
            groupList(group.subGroups).map(s => <ListItem
              key={s._id}
              primaryText={s.name}
              leftIcon={<SocialGroup />}
              onClick={onClickGroup(s._id)}
            />)
          }</List>
          : ''
      }
    </div>
    <div style={{clear: 'both'}}>
      {
        status.editMode && status.session && (
          status.session.isManager ||
          0 < status.session.oids.indexOf(group._id)
        ) &&
        <div>
          <div style={PAPER_STYLE}>
            <div style={{float: 'right'}} >
              <ActionIcon
                iconName={ICONS.NEW_PERSON}
                onTouchTap={onClickNewUser(group)}
              />
              <ActionIcon
                iconName={ICONS.EDIT}
                onTouchTap={onClickEditUserList(PAGE.GROUP_EDITOR_MEMBER, group._id)}
              />
            </div>
            <h3 style={{color: THEME_COLOR1}}>{STR.MEMBER}</h3>
          </div>
        </div>
      }
      {
        group.users && group.users.length
          ? <List>{
            group.users.map(u => <ListItem
              key={u._id}
              primaryText={u.name}
              leftIcon={<SocialPerson />}
              onClick={onClickUser(u._id)}
            />)
          }</List>
          : ''
      }
    </div>
  </div>
  : <Paper style={{...PAPER_STYLE, textAlign: 'center'}} zDepth={1}>
    <p>{STR.GROUP_HAS_BEEN_DELETED}</p>
    <RaisedButton
      label={STR.RESET}
      primary={true}
      onTouchTap={onClickReset}
      style={BUTTON_STYLE}
    />
  </Paper>


Group.propTypes = {
  status: PropTypes.object,
  group: PropTypes.object,
  onClickEditGroup: PropTypes.func,
  onClickDeleteGroup: PropTypes.func,
  onClickEditGroupList: PropTypes.func,
  onClickEditUserList: PropTypes.func,
  onClickNewGroup: PropTypes.func,
  onClickNewUser: PropTypes.func,
  onClickGroup: PropTypes.func,
  onClickUser: PropTypes.func,
  onClickReset: PropTypes.func,
}

export default Group
