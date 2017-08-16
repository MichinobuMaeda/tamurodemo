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
import { grey50, red800 } from 'material-ui/styles/colors';

import { paperStyle } from '../helper'

const Entrance = ({
  password, onAuthIdChanged, onPasswordChanged, onSingInWithPassword,
  onSingInWithGoogle
}) => (
  <div style={{textAlign: "center"}}>
    <p>
      <a href="https://github.com/MichinobuMaeda/tamuro.ui" style={{ "verticalAlign": "bottom" }}>
        tamuro.ui
      </a>
      <img src="tamuro-48.png" alt="屯" style={{ "verticalAlign": "middle", padding: "0 16px 0 16px" }} />
      <a href="https://github.com/MichinobuMaeda/tamuro.api" style={{ "verticalAlign": "top" }}>
        tamuro.api
      </a>
    </p>
    <Paper style={paperStyle} zDepth={1}>
      <TextField
        hintText="ユーザーID"
        floatingLabelText="ユーザーID"
        value={password.authId}
        onChange={onAuthIdChanged}
      /><br/>
      <TextField
        hintText="パスワード"
        floatingLabelText="パスワード"
        value={password.password}
        type="password"
        onChange={onPasswordChanged}
      />
      <p>
        <RaisedButton
          label="IDとパスワードでログイン"
          primary={true}
          disabled={!password.authId || !password.password}
          onTouchTap={onSingInWithPassword}
        />
      </p>
      <p>テスト用のユーザIDは右上の <FontIcon
          className="material-icons" style={{ "verticalAlign": "bottom" }}
        >help</FontIcon> に記載しています。</p>
    </Paper>
    <Paper style={paperStyle} zDepth={1}>
      <p>
        <RaisedButton
          label="Googleでログイン"
          backgroundColor={red800}
          labelColor={grey50}
          onTouchTap={onSingInWithGoogle}
        />
      </p>
    </Paper>
  </div>
)

export default Entrance;
