/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import { List, ListItem } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'

import ContextPageNav from '../containers/ContextPageNav'
import ContextAlertDialog from '../containers/ContextAlertDialog'
import {
  paperStyle, buttonStyle, sortedGroups, isCommittableUser,
  isEditedUser, isEditedUserParents
} from '../helper'
import { PRIV } from '../constants'

const FormUser = ({
  editedUser, user, groups, prim, sess,
  onFieldChanged, onChecked, onSubmit, onCancel, onDelete,
  onProfileSelected, onProfileDelete, onAddProfile
}) => (
  <div>
    <ContextPageNav />
    <ContextAlertDialog />
    <Paper style={paperStyle} zDepth={1}>
      <h2>
        <FontIcon className="material-icons">edit</FontIcon> {
          user.name ? user.name : "新しいユーザー" }
      </h2>
    </Paper>
    <Paper style={paperStyle} zDepth={1}>
      { editedUser.parent && <p>{
        `${editedUser.parent.name} にユーザーを追加します。`  }</p> 
      }
      <TextField
        hintText="グループ名"
        floatingLabelText="グループ名"
        value={editedUser.name}
        onChange={onFieldChanged('name')}
      /><br/>
      <TextField
        hintText="説明"
        floatingLabelText="説明"
        value={editedUser.desc}
        multiLine={true}
        style={{ width: "95%"}}
        onChange={onFieldChanged('desc')}
      />
    </Paper>
    {
      sess.priv === PRIV.MANAGER && editedUser.parents &&
      <Paper style={paperStyle} zDepth={1}>
        <h3>所属するグループ</h3>
        <List> {
          sortedGroups(prim, groups, true).map(g =>
            <ListItem
              leftCheckbox={
                <Checkbox
                  checked={ -1 < editedUser.parents.indexOf(g._id) }
                  onCheck={onChecked(g._id)}
                />
              }
              primaryText={g.name}
            />)
        } </List>
        </Paper>
    }
    {
      editedUser.profiles.map((profile, index) =>
        <Paper style={paperStyle} zDepth={1}>
          <div style={{ float: "right" }}>
            <RaisedButton
              label="削除"
              secondary={true}
              onTouchTap={onProfileDelete(index)}
              style={buttonStyle}
            />
            <RaisedButton
              label="編集"
              primary={true}
              onTouchTap={onProfileSelected(index)}
              style={buttonStyle}
            />
          </div>
          { profile.title.v ? <h3>{ profile.title.v }</h3> : <h3 style={{ color: "#999999" }}>名称未定</h3> }
          <div>
            { profile.zip && `〒${profile.zip.v}` }
          </div>
          <div>
            { profile.country && profile.country.v !== "日本" && `${profile.country.v} ` }
            { profile.state && `${profile.state.v} ` }
            { profile.city && `${profile.city.v} ` }
            { profile.street && `${profile.street.v} ` }
            { profile.bldg && profile.bldg.v }
          </div>
          { profile.tel && <div>Tel: { profile.tel.v }</div> }
          { profile.fax && <div>Fax: { profile.fax.v }</div> }
          { profile.cell && <div>携帯: { profile.cell.v }</div> }
          { profile.email && <div>E-mail: { profile.email.v }</div> }
          { profile.name && <div>{ profile.name.v }</div> }
          { profile.note && <div>{ profile.note.v.split(/\n|\r/).map(line => <div>{ line }</div>) }</div> }
        </Paper>
      )
    }
    <Paper style={paperStyle} zDepth={1}>
      <div style={{ textAlign: "right" }}>
        <RaisedButton
          label="追加"
          primary={true}
          onTouchTap={onAddProfile(editedUser.profiles.length)}
          style={buttonStyle}
        />
      </div>
    </Paper>
    <Paper style={paperStyle} zDepth={1}>
      <div style={{ textAlign: "center" }}>
        <RaisedButton
          label="削除"
          secondary={true}
          disabled={!user._id}
          onTouchTap={onDelete}
          style={buttonStyle}
        />
        <RaisedButton
          label="中止"
          onTouchTap={onCancel}
          style={buttonStyle}
        />
        <RaisedButton
          label="保存"
          primary={true}
          onTouchTap={onSubmit}
          disabled={
            !isCommittableUser(prim, user, editedUser) ||
            (
              !isEditedUser(user, editedUser) &&
              !isEditedUserParents(user, editedUser)
            )
          }
          style={buttonStyle}
        />
      </div>
    </Paper>
  </div>
)

export default FormUser;
