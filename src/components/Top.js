/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

const Top = ({privilege, onPrivilegeChanged}) => (
  <div>
    <SelectField
      hintText="権限"
      floatingLabelText="権限"
      value={privilege}
      onChange={onPrivilegeChanged}
    >
      <MenuItem value={"user"} primaryText="一般" />
      <MenuItem value={"manager"} primaryText="管理者" />
      <MenuItem value={"admin"} primaryText="システム担当者" />
    </SelectField><br/>
    の権限でログインしましたが、サンプルなのでログインした後でも変更できます。
    <p>右上のメニューボタンからログアウトできます。</p>
  </div>
)

export default Top;
