const { apiKeyValidator, api, router } = require('./api')
const { updateVersion } = require('./service')
const {
  guardValidAccount,
  guardGroups,
  guardUserSelfOrGroups
} = require('./guards')
const { createAccount, setEmail, setPassword } = require('./accounts')
const {
  invite,
  validateInvitation,
  setEmailWithInvitation,
  setEmailAndPasswordWithInvitation
} = require('./auth')

const handleUpdateServiceVersion = firebase => async (req, res) => res.send(await updateVersion(firebase))
const handleValidateInvitation = firebase => async (req, res) => res.send(await validateInvitation(req.params, firebase))

const entries = firebase => {

  const { functions } = firebase

  router.use(
    '/updateServiceVersion',
    apiKeyValidator(firebase)
  )

  router.get(
    '/updateServiceVersion',
    handleUpdateServiceVersion(firebase)
  )

  router.get(
    '/invitation/:invitation',
    handleValidateInvitation(firebase)
  )

  api.use('/', router)

  const ctx = context => ({ ...context.auth, ...firebase })
  const adminsOrManagers = ['admins', 'managers']

  return {
    api: functions.https.onRequest(api),
    createAccount: functions.https.onCall(
      (data, context) => guardGroups(
        data, ctx(context), adminsOrManagers, createAccount
      )
    ),
    setEmail: functions.https.onCall(
      (data, context) => guardUserSelfOrGroups(
        data, ctx(context), adminsOrManagers, setEmail
      )
    ),
    setPassword: functions.https.onCall(
      (data, context) => guardUserSelfOrGroups(
        data, ctx(context), adminsOrManagers, setPassword
      )
    ),
    invite: functions.https.onCall(
      (data, context) => guardGroups(
        data, ctx(context), adminsOrManagers, invite
      )
    ),
    validateInvitation: functions.https.onCall(
      (data, context) => validateInvitation(data, ctx(context))
    ),
    setEmailWithInvitation: functions.https.onCall(
      (data, context) => guardValidAccount(
        data, ctx(context), setEmailWithInvitation
      )
    ),
    setEmailAndPasswordWithInvitation: functions.https.onCall(
      (data, context) => guardValidAccount(
        data, ctx(context), setEmailAndPasswordWithInvitation
      )
    ),
    // for Unit test
    handleUpdateServiceVersion: handleUpdateServiceVersion(firebase),
    handleValidateInvitation: handleValidateInvitation(firebase)
  }
}

module.exports = {
  entries
}
