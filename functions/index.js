const admin = require('firebase-admin')
const functions = require('firebase-functions')
const { entries } = require('./entries')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()
const firebase = { functions, db, auth }

const {
  handleUpdateServiceVersion,
  handleValidateInvitation,
  ...exportFunctions
} = entries(firebase)

module.exports = exportFunctions
