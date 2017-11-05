/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import TitleEditor from '../components/TitleEditor'
import {setTitle, commitEditedTitle, discardEditedTitle} from '../actions/status'

const mapStateToProps = ({status}) => {
  return {
    title: status.title,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTextChange: event => dispatch(setTitle(event.target.value)),
    onClickCommit: () => dispatch(commitEditedTitle()),
    onClickCancel: () => dispatch(discardEditedTitle()),
  }
}

const TitleEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TitleEditor)

export default TitleEditorContainer
