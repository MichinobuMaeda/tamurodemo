/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import HelpEditor from '../components/HelpEditor'
import {currentPage} from '../actions/pages'
import {setHelpMd, commitEditedHelp, discardEditedHelp} from '../actions/helps'

const mapStateToProps = ({helps, pages}) => {
  return {
    help: helps.reduce((ret, cur) => cur.pid === currentPage(pages).id ? cur : ret, {}),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onTextChange: pid => event => dispatch(setHelpMd(pid, event.target.value)),
    onClickCommit: pid => () => dispatch(commitEditedHelp(pid)),
    onClickCancel: pid => () => dispatch(discardEditedHelp(pid)),
  }
}

const HelpEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HelpEditor)

export default HelpEditorContainer
