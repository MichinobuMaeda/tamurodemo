import * as init from './init'
import * as service from './service'
import * as auth from './auth'
import * as ui from './ui'
import icon from './icons'
import menuItems from './menuItems'
import * as utils from './utils'

export default {
  ...init,
  ...service,
  ...auth,
  ...ui,
  icon,
  menuItems,
  ...utils
}
