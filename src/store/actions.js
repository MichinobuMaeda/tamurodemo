import * as auth from './actionsAuth'
import * as service from './actionsService'
import * as link from './actionsLink'
import * as init from './actionsInitialize'

export default {
  ...auth,
  ...service,
  ...link,
  ...init
}
