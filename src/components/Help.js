/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import ReactMarkdown from 'react-markdown'

import {PAPER_STYLE, ICONS} from '../constants'
import ActionIcon from './ActionIcon'

const Help = ({helps, status, onClickHelpEditor}) => (
  <div>
    {
      helps.map(h => (
        <Paper style={PAPER_STYLE} zDepth={1} key={h.pid}>
          <div style={{float: 'right'}}>{
            status.editMode && status.session && status.session.isAdmin &&
              <ActionIcon
                iconName={ICONS.EDIT}
                edited={h.edited} 
                onTouchTap={onClickHelpEditor(h.pid)}
              />
          }</div>
          <ReactMarkdown source={h.val}/>
        </Paper>
      ))
    }
  </div>
)

Help.propTypes = {
  helps: PropTypes.array,
  status: PropTypes.object,
  onClickHelpEditor: PropTypes.func,
  onPageBack: PropTypes.func,
}

export default Help
