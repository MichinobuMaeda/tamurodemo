/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FontIcon from 'material-ui/FontIcon'
import Paper from 'material-ui/Paper'

import ContextPageNav from '../containers/ContextPageNav'
import { paperStyle } from '../helper'

const User = ({ user }) => (
  <div>
    <ContextPageNav />
    <Paper style={paperStyle} zDepth={1}>
      <h2><FontIcon className="material-icons">person</FontIcon> { user.name }</h2>
      { user.desc && user.desc.split(/\n|\r/).map(line => <div>{ line }</div>) }
    </Paper>
    {
      user.profiles && user.profiles.map(profile =>
        <Paper style={paperStyle} zDepth={1}>
          <h3>{ profile.title.v }</h3>
          <div>
            { profile.zip && `〒${profile.zip.v}` }
          </div>
          <div>
            { profile.country && profile.country.v !== "日本" && `${profile.country.v} ` }
            { profile.state && `${profile.state.v} ` }
            { profile.city && `${profile.city.v} ` }
            { profile.street && `${profile.street.v} ` }
            { profile.bldg && profile.bldg.v }
          </div>
          { profile.tel && <div>Tel: { profile.tel.v }</div> }
          { profile.fax && <div>Fax: { profile.fax.v }</div> }
          { profile.email && <div>E-mail: { profile.email.v }</div> }
          { profile.name && <div>{ profile.name.v }</div> }
        </Paper>
      )
    }
  </div>
)

export default User;
