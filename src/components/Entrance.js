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
  auth, onAuthIdChanged, onPasswordChanged, onSingInWithPassword,
  onSingInWithGoogle
}) => (
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
      />
      <p>
        <RaisedButton
          label="IDとパスワードでログイン"
          primary={true}
          disabled={!auth.authId || !auth.password}
          onTouchTap={onSingInWithPassword}
        />
      </p>
      <p>テスト用のユーザIDは右上の <FontIcon className="material-icons">help</FontIcon> に記載しています。</p>
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
    <div style={{ "font-family": "monospace" }}>
      <p>
        <a href="https://github.com/MichinobuMaeda/tamuro.api">
          https://github.com/MichinobuMaeda/tamuro.api
        </a>
      </p>
      <p>
        <a href="https://github.com/MichinobuMaeda/tamuro.ui">
          https://github.com/MichinobuMaeda/tamuro.ui
        </a>
      </p>
    </div>
  </div>
)

export default Entrance;
