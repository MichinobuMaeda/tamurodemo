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
import ActionHome from 'material-ui/svg-icons/action/home'

import {PAPER_STYLE, BUTTON_STYLE, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'

const Guest = ({
  status, password, onIdChange, onPasswordChange, onPasswordCommitted
}) => (
  <div>
    <Paper
      style={PAPER_STYLE}
      zDepth={1}
    >
      <h1><ActionHome style={ICON_STYLE_H1} /> {status.title.val}</h1>
    </Paper>
    <div style={{textAlign: 'center'}}>
      <Paper style={PAPER_STYLE} zDepth={1}>
        {STR.SIGN_IN_PLEASE}
      </Paper>
      <Paper style={PAPER_STYLE} zDepth={1}>
        <TextField
          hintText={STR.SIGN_IN_ID}
          floatingLabelText={STR.SIGN_IN_ID}
          value={password.id  }
          onChange={onIdChange}
        />
        <br/>
        <TextField
          hintText={STR.PASSWORD}
          floatingLabelText={STR.PASSWORD}
          value={password.password}
          type="password"
          onChange={onPasswordChange}
        />
        <p>
          <RaisedButton
            label={STR.SIGN_IN_WITH_PASSWORD}
            primary={true}
            disabled={!password.id || !password.password}
            onTouchTap={onPasswordCommitted}
            style={BUTTON_STYLE}
          />
        </p>
      </Paper>
    </div>
  </div>
)

Guest.propTypes = {
  status: PropTypes.object,
  password: PropTypes.object,
  onIdChange: PropTypes.func,
  onPasswordChange: PropTypes.func,
  onPasswordCommitted: PropTypes.func,
}

export default Guest
