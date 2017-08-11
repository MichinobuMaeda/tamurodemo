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
import Dialog from 'material-ui/Dialog'

import ContextPageNav from '../containers/ContextPageNav'
import { grey50, red800 } from 'material-ui/styles/colors';
import { paperStyle } from '../helper'

const Credential = ({
  password, google, dialog,
  onCredAuthIdChanged, onCredPasswordChanged, onCommitAuthIdPassword,
  onDisabledPassword, onSingInWithPassword, onDisconnectGoogle, onConnectGoogle,
  onDialogClose,
}) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      <h2><FontIcon className="material-icons">settings</FontIcon> ログイン方法</h2>
    </Paper>
    <Paper style={{ ...paperStyle, "text-align": "center" }} zDepth={1}>
      <TextField
        id="CredAuthId"
        hintText="ユーザーID"
        floatingLabelText="ユーザーID"
        value={password.authId}
        onChange={onCredAuthIdChanged}
      /><br />
      <TextField
        id="CredPassword"
        hintText="パスワード"
        floatingLabelText="パスワード"
        type="password"
        value={password.password}
        onChange={onCredPasswordChanged}
      />
      <p>
        <RaisedButton
          label="ユーザーIDとパスワードを設定する"
          primary={true}
          disabled={!password.authId || !password.password}
          onTouchTap={onCommitAuthIdPassword}
        />
      </p>
      {
        password._id
          ? <p>
              <RaisedButton
                label="ユーザーIDとパスワードを使わない"
                primary={true}
                onTouchTap={onDisabledPassword}
              />
            </p>
          : ''
      }
    </Paper>
    <Paper style={{ ...paperStyle, "text-align": "center" }} zDepth={1}>
      {
        google._id
          ? <p>
            <RaisedButton
              label="Googleを使わない"
              backgroundColor={red800}
              labelColor={grey50}
              onTouchTap={onDisconnectGoogle}
            />
          </p>
          : <p>
          <RaisedButton
            label="Googleでログイン"
            backgroundColor={red800}
            labelColor={grey50}
            onTouchTap={onConnectGoogle}
          />
        </p>
      }
    </Paper>
    <Dialog
      actions={[
        <RaisedButton
          label="中止"
          onTouchTap={onDialogClose}
        />,
        <RaisedButton
          label="実行"
          primary={true}
          onTouchTap={dialog.action}
        />
      ]}
      modal={false}
      open={dialog.open}
      onRequestClose={onDialogClose}
    >
      {dialog.message}
    </Dialog>
  </div>
)

export default Credential;
