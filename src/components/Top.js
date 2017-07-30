/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'
import FlatButton from 'material-ui/FlatButton'
import { toJaDateTime, nameOfProvider, nameOfPrivilege } from './formatter'

import { PRIV } from '../actions/constants'

const Top = ({priv, sess, prim, onPrivilegeChanged}) => (
  <div>
    <h2>右上のメニュー</h2>
    <div>
      <FlatButton disableTouchRipple={true} primary={true} style={{"text-align": "left"}}
       label="ヘルプ"/>
      : ログインしている場合のヘルプページ。</div>
    <div>
      <FlatButton disableTouchRipple={true} primary={true} style={{"text-align": "left"}}
        label="ログアウト"/>
      : ログアウトして権限やデータを消去。</div>
    <div>
      <FlatButton disableTouchRipple={true} primary={true} style={{"text-align": "left"}}
        label={nameOfPrivilege[PRIV.MANAGER]}/>
      : {nameOfPrivilege[PRIV.MANAGER]}の表示モードにする。権限がある場合だけ表示する。
    </div>
    <div>
      <FlatButton disableTouchRipple={true} primary={true} style={{"text-align": "left"}}
        label={nameOfPrivilege[PRIV.ADMIN]}/>
      : {nameOfPrivilege[PRIV.ADMIN]}の表示モードにする。権限がある場合だけ表示する。
    </div>
    <div>
      <FlatButton disableTouchRipple={true} primary={true} style={{"text-align": "left"}}
        label={nameOfPrivilege[PRIV.USER]}/>
      : {nameOfPrivilege[PRIV.USER]}の表示モードに戻す。
    </div>
    <h2>ログインと権限の情報</h2>
    <Table>
      <TableBody displayRowCheckbox={false}>
        <TableRow>
          <TableRowColumn style={{ width: 160 }}>ユーザID</TableRowColumn>
          <TableRowColumn>{`"${sess.uid}"`}</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>ログイン日時</TableRowColumn>
          <TableRowColumn>{toJaDateTime(sess.createdAt)}</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>ログイン方法</TableRowColumn>
          <TableRowColumn>{nameOfProvider[sess.provider]}</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>所属グループのID</TableRowColumn>
          <TableRowColumn>{sess.gids ? sess.gids.map(gid => `"${gid}"`).join(', ') : ''}</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>表示モード</TableRowColumn>
          <TableRowColumn>{nameOfPrivilege[priv]}</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>{nameOfPrivilege[PRIV.MANAGER]}の権限</TableRowColumn>
          <TableRowColumn>{sess.manager ? '有り' : '無し'}</TableRowColumn>
        </TableRow>
        <TableRow>
          <TableRowColumn>{nameOfPrivilege[PRIV.ADMIN]}の権限</TableRowColumn>
          <TableRowColumn>{sess.admin ? '有り' : '無し'}</TableRowColumn>
        </TableRow>
      </TableBody>
    </Table>

  </div>
)

export default Top;
