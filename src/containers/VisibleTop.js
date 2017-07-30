/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import Top from '../components/Top'

const mapStateToProps = state => {
  return {
    prim: state.prim,
    sess: state.sess,
    priv: state.priv,
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

const VisibleTop = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Top)

export default VisibleTop;
