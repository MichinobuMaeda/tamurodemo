/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'

const Help = ({primary}) => (
  <div>
    {
      primary
        ? <p>ログインしている場合のヘルプページです。</p>
        : <p>ログインしていない場合のヘルプページです。</p>
    }
    <p>左上のホームボタンで戻ってください。</p>
  </div>
)

export default Help;
