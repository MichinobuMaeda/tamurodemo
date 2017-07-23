/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

const Entrance = ({privilege, onPrivilegeChanged, onSingIn}) => (
  <div>
    <TextField
      hintText="ユーザーID"
      floatingLabelText="ユーザーID"
    /><br/>
    <TextField
      hintText="パスワード"
      floatingLabelText="パスワード"
      type="password"
    /><br/>
    <SelectField
      hintText="権限"
      floatingLabelText="権限"
      value={privilege}
      onChange={onPrivilegeChanged}
      errorText={!privilege && '必ず選択してください。'}
    >
      <MenuItem value={"user"} primaryText="一般" />
      <MenuItem value={"manager"} primaryText="管理者" />
      <MenuItem value={"admin"} primaryText="システム担当者" />
    </SelectField><br/>
    <RaisedButton
      label="IDとパスワードでログイン"
      primary={true}
      disabled={!privilege}
      onTouchTap={onSingIn}
    />
    <p>サンプルなのでユーザーIDとパスワードは入れなくていいです。権限だけ選択してください。</p>
  </div>
)

export default Entrance;
