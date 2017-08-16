/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

import { connect } from 'react-redux'

import User from '../components/User'
import { PRIV } from '../constants'
import { getCurrentPage, hasPrivilege } from '../helper'

const mapStateToProps = state => {
  let { page, users, sess } = state 
  let user = users.reduce((ret, u) =>
    u._id === getCurrentPage(page).id ? u : ret, null)
  user.profiles = (sess.priv === PRIV.MANAGER || user._id === sess.uid)
    ? user.profiles
    : user.profiles.filter(prof => hasPrivilege(prof.title.p, sess.gids))
  user.profiles = user.profiles.map(
    prof => (sess.priv === PRIV.MANAGER || user._id === sess.uid)
      ? prof
      : Object.keys(prof)
        .filter(key => key !== 'title' || hasPrivilege(prof[key].p, sess.gids))
        .reduce((ret, cur) => { ret[cur] = prof[cur]; return ret }, {})
  )
  return {
    user: {...user},
    sess,
  }
}

const mapDispatchToProps = dispatch => {
  return {} 
}

const VisibleUser = connect(
  mapStateToProps,
  mapDispatchToProps,
)(User)

export default VisibleUser;
