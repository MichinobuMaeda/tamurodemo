const admin = require('firebase-admin')
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const { entries } = require('./entries')

const api = express()
api.use(cors({ origin: true }))
const router = express.Router()

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()
const messaging = admin.messaging()
const logger = functions.logger
const firebase = { functions, db, auth, messaging, logger }

const ent = entries(firebase, api, router)

exports.api =
  functions.https.onRequest(ent.api)
exports.createAccount =
  functions.https.onCall(ent.createAccount)
exports.setEmail =
  functions.https.onCall(ent.setEmail)
exports.setPassword =
  functions.https.onCall(ent.setPassword)
exports.invite =
  functions.https.onCall(ent.invite)
exports.validateInvitation =
  functions.https.onCall(ent.validateInvitation)
exports.setEmailWithInvitation =
  functions.https.onCall(ent.setEmailWithInvitation)
exports.setEmailAndPasswordWithInvitation =
  functions.https.onCall(ent.setEmailAndPasswordWithInvitation)
exports.signInWithLine =
  functions.https.onCall(ent.signInWithLine)
exports.resetUserAuth =
  functions.https.onCall(ent.resetUserAuth)
exports.getProfile =
  functions.https.onCall(ent.getProfile)
exports.rejectCreateUserWithoutAccount =
  functions.auth.user().onCreate(ent.rejectCreateUserWithoutAccount)
exports.notifyMessage =
  functions.firestore.document('groups/{groupId}/messages/{messageId}')
    .onCreate(ent.notifyMessage)
