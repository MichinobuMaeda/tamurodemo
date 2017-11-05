/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import ActionHome from 'material-ui/svg-icons/action/home'

import {PAPER_STYLE, ICON_STYLE_H1} from '../constants'
import {STR, welcomeTitle} from '../preferences'
import CertEditorContainer from '../containers/CertEditorContainer'

const Welcome = ({status, user}) => (
  <div>
    <Paper
      style={PAPER_STYLE}
      zDepth={1}
    >
      <h1><ActionHome style={ICON_STYLE_H1} /> {status.title.val}</h1>
    </Paper>
    <Paper
      style={{
        ...PAPER_STYLE,
        textAlign: 'center'
      }}
      zDepth={1}
    >
      <h2>{welcomeTitle(user)}</h2>
      <p>{STR.CHOICE_SING_IN_PROVIDER}</p>
    </Paper>
    <CertEditorContainer/>
  </div>
)

Welcome.propTypes = {
  status: PropTypes.object,
  user: PropTypes.object,
}

export default Welcome
