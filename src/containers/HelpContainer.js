/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import {connect} from 'react-redux'

import Help from '../components/Help'
import {PAGE} from '../constants'
import {setPage} from '../actions/pages'

const mapStateToProps = ({helps, status}) => {
  return {
    helps,
    status,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onClickHelpEditor: priv => () => dispatch(setPage(PAGE.HELP_EDITOR, priv)),
  }
}

const HelpContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Help)

export default HelpContainer
