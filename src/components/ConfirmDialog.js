/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Dialog from 'material-ui/Dialog'
import ActionIcon from './ActionIcon'

import {ICONS} from '../constants'

const ConfirmDialog = ({confirmation, handleOk, handleCancel}) =>
  <Dialog
    title={confirmation.title}
    actions={[
      <ActionIcon
        key={0}
        iconName={ICONS.CONFIRM}
        onTouchTap={handleOk(confirmation)}
      />,
      <ActionIcon
        key={1}
        iconName={ICONS.CANCEL}
        onTouchTap={handleCancel}
      />
    ]}
    modal={false}
    open={confirmation.open}
    onRequestClose={handleCancel}
  >
    {confirmation.message}
  </Dialog>

ConfirmDialog.propTypes = {
  confirmation: PropTypes.object,
  handleOk: PropTypes.func,
  handleCancel: PropTypes.func,
}

export default ConfirmDialog
