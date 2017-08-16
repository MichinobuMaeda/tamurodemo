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
import Chip from 'material-ui/Chip'

import ContextPageNav from '../containers/ContextPageNav'
import ContextPermissionSelector from '../containers/ContextPermissionSelector'
import {
  paperStyle, buttonStyle, getCurrentPage
} from '../helper'
import { profileFields, findOneById } from '../helper'

const FormUserProfile = ({
  editedUser, user, groups, prim, page,
  onFieldChanged, onPrivChange, onReturn, onDelete
}) => (
  <div>
    <ContextPageNav />
    <ContextPermissionSelector />
    <Paper style={paperStyle} zDepth={1}>
      <h2>
        <FontIcon className="material-icons">edit</FontIcon> {
          user.name ? user.name : "新しいユーザー" }
      </h2>
    </Paper>
    {
      editedUser.profiles && editedUser.profiles.filter((p, i) => i === getCurrentPage(page).id).map(profile =>
        <Paper style={paperStyle} zDepth={1}>
          {
            profileFields.map(field =>
              <div>
                <TextField
                  hintText={field.name}
                  floatingLabelText={field.name}
                  multiLine={field.multiLine}
                  value={profile[field.key] && profile[field.key].v}
                  onChange={onFieldChanged(getCurrentPage(page).id, field.key)}
                /><br/>
                <div style={{ display: 'flex' }}>
                  <RaisedButton
                    label="表示範囲変更"
                    onTouchTap={onPrivChange(getCurrentPage(page).id, field.key, profile[field.key] && profile[field.key].p)}
                    style={buttonStyle}
                  />
                  {
                    profile[field.key] && profile[field.key].p.map(p =>
                      <Chip style={{ margin: "0 4px 0 4px" }}>{ p === prim.top ? "全員" : findOneById(groups, p).name }</Chip>) }
                </div>
              </div>
            )
          }
        </Paper>
      )
    }
    <Paper style={paperStyle} zDepth={1}>
      <div style={{ textAlign: "center" }}>
        <RaisedButton
          label="戻る"
          primary={true}
          onTouchTap={onReturn}
          style={buttonStyle}
        />
        </div>
    </Paper>
  </div>
)

export default FormUserProfile;
