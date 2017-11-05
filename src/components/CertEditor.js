/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'

import {PAPER_STYLE, BUTTON_STYLE} from '../constants'
import {validatePassword} from '../preferences'
import {STR} from '../preferences'
import ConfirmDialogContainer from '../containers/ConfirmDialogContainer'

const CertEditor = ({
  page, password,
  onIdChange, onPasswordChange, onConfirmChange,
  onPasswordCommitted, onConfirmDeletePassword
}) => (
  <div style={{textAlign: 'center'}}>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <TextField
        hintText={STR.SIGN_IN_ID}
        floatingLabelText={STR.SIGN_IN_ID}
        value={password.id}
        onChange={onIdChange(page.id)}
      />
      <br/>
      <TextField
        hintText={STR.PASSWORD}
        floatingLabelText={STR.PASSWORD}
        value={password.password}
        type="password"
        onChange={onPasswordChange(page.id)}
      />
      <br/>
      <TextField
        hintText={STR.CONFIRM_PASSWORD}
        floatingLabelText={STR.CONFIRM_PASSWORD}
        value={password.confirm}
        type="password"
        onChange={onConfirmChange(page.id)}
      />
      <br/>
      <RaisedButton
        label={STR.SET_ID_PASSWORD}
        primary={true}
        disabled={
          !password.id ||
          !password.password ||
          password.password !== password.confirm ||
          !validatePassword(password.password)
        }
        onTouchTap={
          password.id &&
          password.password &&
          password.password === password.confirm &&
          validatePassword(password.password) &&
          onPasswordCommitted(page.id)
        }
        style={BUTTON_STYLE}
      />
      {
        password.ver &&
        <p>
          <RaisedButton
            label={STR.DELETE_PASSWORD}
            secondary={true}
            onTouchTap={onConfirmDeletePassword(page.id)}
            style={BUTTON_STYLE}
          />
        </p>
      }
    </Paper>
    <ConfirmDialogContainer />
  </div>
)

CertEditor.propTypes = {
  page: PropTypes.object,
  password: PropTypes.object,
  onIdChange: PropTypes.func,
  onPasswordChange: PropTypes.func,
  onConfirmChange: PropTypes.func,
  onPasswordCommitted: PropTypes.func,
  onConfirmDeletePassword: PropTypes.func,
}

export default CertEditor
