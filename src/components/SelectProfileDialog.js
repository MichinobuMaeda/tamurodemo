/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import React from 'react'
import PropTypes from 'prop-types'
import Dialog from 'material-ui/Dialog'
import {List, ListItem} from 'material-ui/List'
import ActionIcon from './ActionIcon'
import RadioButtonChecked from 'material-ui/svg-icons/toggle/radio-button-checked'
import RadioButtonUnchecked from 'material-ui/svg-icons/toggle/radio-button-unchecked'

import {ICONS} from '../constants'
import {profileTemplates} from '../preferences'

const SelectProfileDialog = ({
  page, profileSelection, handleOk, handleCancel, onClickTemplate}
) =>
  <Dialog
    title={''}
    actions={[
      <ActionIcon
        key={0}
        iconName={ICONS.CONFIRM}
        disabled={!profileSelection.tag}
        onTouchTap={profileSelection.tag && handleOk(page.id, profileSelection.tag)}
      />,
      <ActionIcon
        key={1}
        iconName={ICONS.CANCEL}
        onTouchTap={handleCancel}
      />
    ]}
    modal={false}
    open={profileSelection.open}
    onRequestClose={handleCancel}
  >
    <List>
      {
        profileTemplates.map(t => <ListItem
          key={t.tag}
          primaryText={t.tag}
          secondaryText={t.desc}
          leftIcon={profileSelection.tag ===t.tag ? <RadioButtonChecked/> : <RadioButtonUnchecked/>}
          onClick={onClickTemplate(t.tag)}
        />)
      }
    </List>
  </Dialog>

SelectProfileDialog.propTypes = {
  page: PropTypes.object,
  profileSelection: PropTypes.object,
  handleOk: PropTypes.func,
  handleCancel: PropTypes.func,
  onClickTemplate: PropTypes.func,
}

export default SelectProfileDialog
