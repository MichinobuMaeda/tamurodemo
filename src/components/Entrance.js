/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'

const Entrance = ({auth, onAuthIdChanged, onPasswordChanged, onSingInWithPassword}) => (
  <div style={{"text-align": "center"}}>
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
    <h2>サンプルデータの説明</h2>
    <Table selectable={false}>
      <TableHeader displaySelectAll={false}>
        <TableHeaderColumn>ユーザID</TableHeaderColumn>
        <TableHeaderColumn>パスワード</TableHeaderColumn>
        <TableHeaderColumn>管理者</TableHeaderColumn>
        <TableHeaderColumn>システム担当者</TableHeaderColumn>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        <TableRow>
          <TableRowColumn>ryu</TableRowColumn>
          <TableRowColumn>pass</TableRowColumn>
          <TableRowColumn>○</TableRowColumn>
          <TableRowColumn>○</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>miri</TableRowColumn>
          <TableRowColumn>pass</TableRowColumn>
          <TableRowColumn>○</TableRowColumn>
          <TableRowColumn>×</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>shun</TableRowColumn>
          <TableRowColumn>pass</TableRowColumn>
          <TableRowColumn>×</TableRowColumn>
          <TableRowColumn>○</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>yasu</TableRowColumn>
          <TableRowColumn>pass</TableRowColumn>
          <TableRowColumn>×</TableRowColumn>
          <TableRowColumn>×</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>ken</TableRowColumn>
          <TableRowColumn>pass</TableRowColumn>
          <TableRowColumn>×</TableRowColumn>
          <TableRowColumn>×</TableRowColumn>
        </TableRow>
      </TableBody>
    </Table>
  </div>
)

export default Entrance;
