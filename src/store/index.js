import * as init from './init'
import * as service from './service'
import * as auth from './auth'
import * as users from './users'
import * as ui from './ui'
import * as validators from './validators'
import icon from '../conf/icons'
import menuItems from './menuItems'
import * as utils from './utils'

export default {
  ...init,
  ...service,
  ...auth,
  ...users,
  ...ui,
  ...validators,
  icon,
  menuItems,
  ...utils
}
