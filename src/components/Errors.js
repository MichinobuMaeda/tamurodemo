/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'

import {PAPER_STYLE, BUTTON_STYLE} from '../constants'
import {STR, errorMessage} from '../preferences'

const Errors = ({errors, onPageBack}) => (
  <div>
    <Paper style={PAPER_STYLE} zDepth={1}>
      {
        errors && errors.map((error, i) => (
          <p key={i.toString()}>{errorMessage(error)}</p>
        ))
      }
      <p style={{textAlign: 'center'}}>
        <RaisedButton
          label={STR.BACK}
          primary={true}
          onTouchTap={onPageBack}
          style={BUTTON_STYLE}
        />
      </p>
    </Paper>
  </div>
)

Errors.propTypes = {
  errors: PropTypes.array,
  onPageBack: PropTypes.func,
}

export default Errors
