/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import FontIcon from 'material-ui/FontIcon'

const Help = ({prim}) => (
  <div>
    {
      prim
        ? <p>ログインしている場合のヘルプページです。</p>
        : <p>ログインしていない場合のヘルプページです。</p>
    }
    <p>右上の <FontIcon className="material-icons">highlight_off</FontIcon> で戻ってください。</p>
  </div>
)

export default Help;
