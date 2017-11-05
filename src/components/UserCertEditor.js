/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import ActionVerifiedUser from 'material-ui/svg-icons/action/verified-user'

import {PAPER_STYLE, ICON_STYLE_H1, ICONS} from '../constants'
import {STR} from '../preferences'
import ActionIcon from './ActionIcon'
import CertEditorContainer from '../containers/CertEditorContainer'

const UserCertEditor = ({user, onClickCancel}) => (
  <div>
    <Paper
      style={PAPER_STYLE}
      zDepth={1}
    >
      <h1><ActionVerifiedUser style={ICON_STYLE_H1} /> {user.name}</h1>
    </Paper>
    <div style={{float: 'right'}}>
      <ActionIcon
        iconName={ICONS.CANCEL}
        onTouchTap={onClickCancel(user._id)}
      />
    </div>
    <h2 style={PAPER_STYLE}>{STR.EDIT_SIGN_IN_METHOD}</h2>
    <div style={{clear: 'both'}}></div>
    <CertEditorContainer/>
  </div>
)

UserCertEditor.propTypes = {
  user: PropTypes.object,
  onClickCancel: PropTypes.func,
}

export default UserCertEditor
