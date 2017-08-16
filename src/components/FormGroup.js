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
  paperStyle, buttonStyle, sortedGroups, isCommittableGroup,
  isEditedGroup, isEditedGroupParents
} from '../helper'

const FormGroup = ({
  editedGroup, group, groups, prim,
  onFieldChanged, onChecked, onSubmit, onCancel, onDelete
}) => (
  <div>
    <ContextPageNav />
    <ContextAlertDialog />
    <Paper style={paperStyle} zDepth={1}>
      <h2>
        <FontIcon className="material-icons">edit</FontIcon> {
          group.name ? group.name : "新しいグループ" }
      </h2>
    </Paper>
    <Paper style={paperStyle} zDepth={1}>
      { editedGroup.parent && <p>{
        `${editedGroup.parent.name} にサブ・グループを追加します。`  }</p> 
      }
      <TextField
        hintText="グループ名"
        floatingLabelText="グループ名"
        value={editedGroup.name}
        onChange={onFieldChanged('name')}
      /><br/>
      <TextField
        hintText="説明"
        floatingLabelText="説明"
        value={editedGroup.desc}
        multiLine={true}
        style={{ width: "95%"}}
        onChange={onFieldChanged('desc')}
      />
    </Paper>
    { 
      editedGroup.parents && editedGroup._id !== prim.top &&
      <Paper style={paperStyle} zDepth={1}>
        <h3>所属するグループ</h3>
        <List> {
          sortedGroups(prim, groups, true).filter(g => g._id !== editedGroup._id).map(g =>
            <ListItem
              leftCheckbox={
                <Checkbox
                  checked={ -1 < editedGroup.parents.indexOf(g._id) }
                  onCheck={onChecked(g._id)}
                />
              }
              primaryText={g.name}
            />)
        } </List>
        </Paper>
    }
    <Paper style={paperStyle} zDepth={1}>
      <div style={{ textAlign: "center" }}>
        <RaisedButton
          label="削除"
          secondary={true}
          disabled={
            !group._id ||
            group._id === prim.top ||
            group._id === prim.manager ||
            group._id === prim.admin
          }
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
            !isCommittableGroup(prim, editedGroup) ||
            (
              !isEditedGroup(group, editedGroup) &&
              !isEditedGroupParents(group, editedGroup)
            )
          }
          style={buttonStyle}
        />
      </div>
    </Paper>
  </div>
)

export default FormGroup;
