const functions = require('firebase-functions')

const throwUnauthenticated = (msg, uid) => {
  console.error('unauthenticated: ' + (msg || '') + (uid || ''))
  throw new functions.https.HttpsError('unauthenticated', (msg || '') + (uid || ''))
}

const throwPermissionDenied = (msg, uid) => {
  console.error('permission-denied: ' + (msg || '') + (uid || ''))
  throw new functions.https.HttpsError('permission-denied', (msg || '') + (uid || ''))
}

const throwErrorDataLoss = (proc, data, err) => {
  console.error('data-loss', proc, JSON.stringify(data), err.message, err.details)
  throw new functions.https.HttpsError('data-loss', err.message, err.details)
}

module.exports = {
  throwUnauthenticated,
  throwPermissionDenied,
  throwErrorDataLoss
}
