/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import IconButton from 'material-ui/IconButton'

import {ICON_STYLE, ICON_BUTTON_STYLE} from '../constants'
import {BG_COLOR, FG_COLOR, icon} from '../preferences'

const ActionIcon = ({iconName, disabled, reverse, onTouchTap}) => {
  let Icon = icon(iconName)
  return (
    <IconButton
      onTouchTap={onTouchTap}
      iconStyle={ICON_STYLE}
      style={{
        ...ICON_BUTTON_STYLE,
        backgroundColor: reverse ? FG_COLOR : BG_COLOR,
      }}
      disabled={disabled}
    >
      <Icon color={reverse ? BG_COLOR : FG_COLOR} />
    </IconButton>
  )
}

ActionIcon.propTypes = {
  iconName: PropTypes.string,
  disabled: PropTypes.bool,
  reverse: PropTypes.bool,
  onTouchTap: PropTypes.func,
}

export default ActionIcon
