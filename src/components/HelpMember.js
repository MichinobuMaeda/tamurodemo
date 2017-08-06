/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'

import { nameOfPrivilege, paperStyle } from './formatter'
import { PRIV } from '../actions/constants'

const HelpMember = () => (
  <div>
    <Paper style={paperStyle} zDepth={1}>
      ログインしている場合のヘルプページです。
      右上の <FontIcon className="material-icons">highlight_off</FontIcon> で戻ってください。
    </Paper>
    <Paper style={paperStyle} zDepth={1}>
      <h2>メニュー項目</h2>
      <di>
        <dt>ヘルプ</dt>
        <dd>ログインしている場合のヘルプページ。</dd>
      </di>
      <di>
        <dt>ログアウト</dt>
        <dd>ログアウトして権限やデータを消去する。</dd>
      </di>
      <di>
        <dt>{nameOfPrivilege[PRIV.MANAGER]}</dt>
        <dd>{nameOfPrivilege[PRIV.MANAGER]}の表示モードにする。権限がある場合だけ表示する。</dd>
      </di>
      <di>
        <dt>{nameOfPrivilege[PRIV.ADMIN]}</dt>
        <dd>{nameOfPrivilege[PRIV.ADMIN]}の表示モードにする。権限がある場合だけ表示する。</dd>
      </di>
      <di>
        <dt>{nameOfPrivilege[PRIV.USER]}</dt>
        <dd>{nameOfPrivilege[PRIV.USER]}の表示モードに戻す。</dd>
      </di>
    </Paper>
  </div>
)

export default HelpMember;
