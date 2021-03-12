const axios = require('axios')
const admin = require('firebase-admin')
const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const { entries } = require('./entries')

const region = 'asia-northeast2'

const api = express()
api.use(cors({ origin: true }))
const router = express.Router()

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()
const messaging = admin.messaging()
const logger = functions.logger
const storage = admin.storage()
const firebase = { functions, db, storage, auth, messaging, logger }

const ent = entries(firebase, api, router, axios)

exports.api =
  functions.region('us-central1').https.onRequest(ent.api)
exports.createAccount =
  functions.region(region).https.onCall(ent.createAccount)
exports.setEmail =
  functions.region(region).https.onCall(ent.setEmail)
exports.setPassword =
  functions.region(region).https.onCall(ent.setPassword)
exports.invite =
  functions.region(region).https.onCall(ent.invite)
exports.validateInvitation =
  functions.region(region).https.onCall(ent.validateInvitation)
exports.setEmailWithInvitation =
  functions.region(region).https.onCall(ent.setEmailWithInvitation)
exports.setEmailAndPasswordWithInvitation =
  functions.region(region).https.onCall(ent.setEmailAndPasswordWithInvitation)
exports.signInWithLineMe =
  functions.region(region).https.onCall(ent.signInWithLineMe)
exports.resetUserAuth =
  functions.region(region).https.onCall(ent.resetUserAuth)
exports.getProfile =
  functions.region(region).https.onCall(ent.getProfile)
exports.provideImage =
  functions.region(region).https.onCall(ent.provideImage)
exports.rejectCreateUserWithoutAccount =
  functions.region(region).auth.user().onCreate(ent.rejectCreateUserWithoutAccount)
exports.onGroupCharCreate =
  functions.region(region).firestore.document('groups/{groupId}/chat/{messageId}')
    .onCreate(ent.onGroupCharCreate)
exports.onHotlineCreate =
  functions.region(region).firestore.document('accounts/{accountId}/hotline/{messageId}')
    .onCreate(ent.onHotlineCreate)
