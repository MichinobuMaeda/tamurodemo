/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

import LinearProgress from 'material-ui/LinearProgress';
import FontIcon from 'material-ui/FontIcon'

const Progress = () => (
  <div style={{"text-align": "center"}}>
    <h2>お待ちください</h2>    
    <LinearProgress mode="indeterminate" />
    <p>
      いつまでたっても表示が変わらない場合は、ページを更新するか、左上の
      <FontIcon className="material-icons">home</FontIcon>
      でトップページに戻ってみてください。
    </p>
  </div>
);

export default Progress;
