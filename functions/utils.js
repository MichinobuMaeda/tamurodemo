const functions = require('firebase-functions')
const { warn, error } = require("firebase-functions/lib/logger")

const throwUnauthenticated = (msg, uid) => {
  warn('unauthenticated: ' + (msg || '') + (uid || ''))
  throw new functions.https.HttpsError('unauthenticated', (msg || '') + (uid || ''))
}

const throwPermissionDenied = (msg, uid) => {
  warn('permission-denied: ' + (msg || '') + (uid || ''))
  throw new functions.https.HttpsError('permission-denied', (msg || '') + (uid || ''))
}

const throwErrorDataLoss = (proc, data, err) => {
  error('data-loss', proc, JSON.stringify(data), err.message, err.details)
  throw new functions.https.HttpsError('data-loss', err.message, err.details)
}

module.exports = {
  throwUnauthenticated,
  throwPermissionDenied,
  throwErrorDataLoss
}
