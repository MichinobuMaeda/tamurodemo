/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import ActionHome from 'material-ui/svg-icons/action/home'

import {PAPER_STYLE, BUTTON_STYLE, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'

const GoodBye = ({status}) => (
  <div>
    <Paper
      style={PAPER_STYLE}
      zDepth={1}
    >
      <h1><ActionHome style={ICON_STYLE_H1} /> {status.title.val}</h1>
    </Paper>
    <div style={{textAlign: 'center'}}>
      <Paper
        style={PAPER_STYLE}
        zDepth={1}
      >
        <p>{STR.SIGNED_OUT}</p>
        <p>
          <RaisedButton
            label={STR.SIGN_IN}
            primary={true}
            href={'./'}
            style={BUTTON_STYLE}
          />
        </p>
      </Paper>
    </div>
  </div>
)

GoodBye.propTypes = {
  status: PropTypes.object,
}

export default GoodBye
