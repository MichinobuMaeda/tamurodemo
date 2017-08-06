/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'

import { paperStyle } from './formatter'

const Entrance = ({ auth, onAuthIdChanged, onPasswordChanged, onSingInWithPassword }) => (
  <div style={{"text-align": "center"}}>
    <Paper style={paperStyle} zDepth={1}>
      <TextField
        hintText="ユーザーID"
        floatingLabelText="ユーザーID"
        value={auth.authId}
        onChange={onAuthIdChanged}
      /><br/>
      <TextField
        hintText="パスワード"
        floatingLabelText="パスワード"
        value={auth.password}
        type="password"
        onChange={onPasswordChanged}
      /><br/>
      <RaisedButton
        label="IDとパスワードでログイン"
        primary={true}
        disabled={!auth.authId || !auth.password}
        onTouchTap={onSingInWithPassword}
      />
    </Paper>
    <p>テスト用のユーザIDは右上の <FontIcon className="material-icons">help</FontIcon> に記載しています。</p>
  </div>
)

export default Entrance;
