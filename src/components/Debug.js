/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'

import {PAPER_STYLE} from '../constants'

const Debug = ({state}) => (
  <div>
    <Paper style={PAPER_STYLE} zDepth={1}>
      <h2>State</h2>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </Paper>
  </div>
)

Debug.propTypes = {
  state: PropTypes.object,
  onPageBack: PropTypes.func,
}

export default Debug
