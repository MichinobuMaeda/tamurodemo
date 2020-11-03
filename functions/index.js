const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { entries } = require('./entries')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()
const firebase = { functions, db, FieldValue: admin.firestore.FieldValue, auth }

const ent = entries(firebase)

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
exports.resetUserAuth =
  functions.https.onCall(ent.resetUserAuth)
exports.rejectCreateUserWithoutAccount =
  functions.auth.user().onCreate(ent.rejectCreateUserWithoutAccount)
