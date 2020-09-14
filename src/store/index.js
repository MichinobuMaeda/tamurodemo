import * as init from './init'
import * as service from './service'
import * as auth from './auth'
import * as ui from './ui'
import menuItems from './menuItems'
import * as utils from './utils'

export default {
  ...init,
  ...service,
  ...auth,
  ...ui,
  menuItems,
  ...utils
}
