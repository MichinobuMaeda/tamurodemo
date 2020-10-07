const express = require('express')
const cors = require('cors')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { apiKeyValidator, api } = require('./api')
const { updateVersion } = require('./service')
const {
  guardGroups,
  guardUserSelfOrGroups,
  createAccount,
  setEmail,
  setPassword
} = require('./accounts')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()
const firebase = { functions, db, auth }

api.use(apiKeyValidator(db))

api.get(
  '/updateServiceVersion',
  async (req, res) => {
    return res.send(await updateVersion(db))
  }
)

exports.api = functions.https.onRequest(api)

const ctx = context => ({ ...context.auth.uid, ...firebase })
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
