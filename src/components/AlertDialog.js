/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import FontIcon from 'material-ui/FontIcon'
import Dialog from 'material-ui/Dialog'
import { buttonStyle } from '../helper'

const AlertDialog = ({
  alert, onDialogClose,
}) => (
  <Dialog
    actions={[
      <RaisedButton
        label={alert.cancel}
        onTouchTap={onDialogClose}
        style={buttonStyle}
      />,
      <RaisedButton
        label={alert.ok}
        primary={true}
        onTouchTap={alert.action}
        style={buttonStyle}
      />
    ]}
    modal={false}
    open={alert.open}
    onRequestClose={onDialogClose}
  >
  <FontIcon
    className="material-icons"
    style={{ fontSize: "36px", verticalAlign: "middle", margin: "0 8px 0 0" }}
  >warning</FontIcon> {alert.message}
  </Dialog>
)

export default AlertDialog;
