/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'

import { paperStyle } from './formatter'

const HelpGuest = () => (
  <div>
    <Paper style={paperStyle} zDepth={1}>
      ログインしていない場合のヘルプページです。右上の <FontIcon className="material-icons">highlight_off</FontIcon> で戻ってください。
    </Paper>
    <Paper style={paperStyle} zDepth={1}>
      <h2>テスト用のユーザID / パスワード / 権限</h2>
      <di>
        <dt>芥川龍之介</dt>
        <dd>ryu / pass / 管理者、システム担当者</dd>
      </di>
      <di>
        <dt>柳美里</dt>
        <dd>miri / pass / 管理者</dd>
      </di>
      <di>
        <dt>目取真俊</dt>
        <dd>shun / pass / システム担当者</dd>
      </di>
      <di>
        <dt>川端康成</dt>
        <dd>yasu / pass / 一般ユーザ</dd>
      </di>
      <di>
        <dt>大江健三郎</dt>
        <dd>ken / pass / 一般ユーザ</dd>
      </di>
    </Paper>
  </div>
)

export default HelpGuest;
