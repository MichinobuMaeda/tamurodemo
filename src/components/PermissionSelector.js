/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import { List, ListItem } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'

import { PRIV } from '../constants'
import { buttonStyle, nameOfPrivilege, sortedGroups } from '../helper'

const PermissionSelector = ({
  prim, groups, permission,
  onChecked, onSubmit, onDialogClose,
}) => (
  <Dialog
    actions={[
      <RaisedButton
        label="中止"
        onTouchTap={onDialogClose}
        style={buttonStyle}
      />,
      <RaisedButton
        label="設定"
        primary={true}
        onTouchTap={onSubmit(permission)}
        style={buttonStyle}
      />
    ]}
    title={`表示するグループを選択してください。${nameOfPrivilege[PRIV.MANAGER]}はすべての項目を参照することができます。`}
    modal={false}
    open={permission.open}
    onRequestClose={onDialogClose}
    autoScrollBodyContent={true}
  >
    <List>
      {
        sortedGroups(prim, groups, true, false).map(g =>
          <ListItem
            leftCheckbox={
              <Checkbox
                checked={ -1 < permission.p.indexOf(g._id) }
                onCheck={onChecked(g._id)}
              />
            }
            primaryText={ g._id === prim.top ? "全員" : g.name }
          />)
      }      
    </List>
  </Dialog>
)

export default PermissionSelector;
