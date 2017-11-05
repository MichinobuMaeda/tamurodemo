/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import IconButton from 'material-ui/IconButton'
import SocialPersonOutline from 'material-ui/svg-icons/social/person-outline'
import ContentDrafts from 'material-ui/svg-icons/content/drafts'

import {PAPER_STYLE, ICON_STYLE_H1} from '../constants'
import {STR} from '../preferences'

const Invitees = ({invitees, onClickInvite}) =>
  <div>
    <Paper
      style={PAPER_STYLE} zDepth={1}>
      <h1><SocialPersonOutline style={ICON_STYLE_H1} /> {STR.INVITEE}</h1>
    </Paper>
    {
      invitees &&
      <div>{
        invitees.map(u => <div key={u._id} style={{clear: 'both'}}>
          <IconButton
            onTouchTap={!u.token && onClickInvite(u._id)}
            style={{float: 'left'}}
          >
            {u.token ? <SocialPersonOutline/> : <ContentDrafts />}
          </IconButton>
          <div>{u.name}</div>
          <div>{u.token ? (
            process.env.NODE_ENV === 'development' ? u.token.replace('3000', '3001') : u.token
          ) : STR.NOT_INVITED}</div>
        </div>)
      }</div>
    }
  </div>

Invitees.propTypes = {
  invitees: PropTypes.array,
  onClickInvite: PropTypes.func,
}

export default Invitees
