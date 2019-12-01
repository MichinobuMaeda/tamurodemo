import * as auth from './actionsAuth'
import * as service from './actionsService'
import * as init from './actionsInitialize'

export default {
  ...auth,
  ...service,
  ...init
}
