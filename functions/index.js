const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { updateVersion } = require('./service')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()

exports.updateServiceVersion = functions.https.onCall(
  (data, context) => {
    try {
      return updateVersion(db)
    } catch (e) {
      throw new functions.https.HttpsError('unknown', e.toString())
    }
  }
)
