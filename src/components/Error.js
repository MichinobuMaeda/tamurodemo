/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import RaisedButton from 'material-ui/RaisedButton'

import { errorMessage } from '../helper'

const Error = ({error, onErrorConfirm}) => (
  <div style={{textAlign: "center"}}>
    {
      error.map(err => 
        <div>
          <p>{ errorMessage[err.path][err.req] }</p>
          <p>{ err.e && JSON.stringify(err.e) }</p>
        </div>
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
