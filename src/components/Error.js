/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import RaisedButton from 'material-ui/RaisedButton'

import { errorMessage } from './formatter'

const Error = ({error, onErrorConfirm}) => (
  <div style={{"text-align": "center"}}>
    {
      error.map(err => 
        <p>{ errorMessage[err.path][err.req] }</p>
      )
    }
    <RaisedButton
      label="戻る"
      primary={true}
      onTouchTap={onErrorConfirm}
    />
  </div>
)

export default Error;
