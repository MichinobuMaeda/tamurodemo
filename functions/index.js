const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { apiKeyValidator, api, router } = require('./api')
const { updateVersion } = require('./service')
const { guardGroups, guardUserSelfOrGroups} = require('./guard')
const { createAccount, setEmail, setPassword } = require('./accounts')
const { invite, validateInvitation } = require('./auth')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()
const firebase = { functions, db, auth }

router.use(
  '/updateServiceVersion',
  apiKeyValidator(firebase)
)

router.get(
  '/updateServiceVersion',
  async (req, res) => res.send(await updateVersion(firebase))
)

router.get(
  '/invitation/:invitation',
  async (req, res) => res.send(await validateInvitation(req.params, firebase))
)

api.use('/', router)
exports.api = functions.https.onRequest(api)

const ctx = context => ({ ...context.auth, ...firebase })
const adminsOrManagers = ['admins', 'managers']

exports.createAccount = functions.https.onCall(
  (data, context) => guardGroups(
    data, ctx(context), adminsOrManagers, createAccount
  )
)

exports.setEmail = functions.https.onCall(
  (data, context) => guardUserSelfOrGroups(
    data, ctx(context), adminsOrManagers, setEmail
  )
)

exports.setPassword = functions.https.onCall(
  (data, context) => guardUserSelfOrGroups(
    data, ctx(context), adminsOrManagers, setPassword
  )
)

exports.invite = functions.https.onCall(
  (data, context) => guardGroups(
    data, ctx(context), adminsOrManagers, invite
  )
)

exports.validateInvitation = functions.https.onCall(
  (data, context) => validateInvitation(data, ctx(context))
)
