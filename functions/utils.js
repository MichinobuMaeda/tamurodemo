const functions = require('firebase-functions')
const { warn, error } = require('firebase-functions/lib/logger')

const firestoreTimestampToISOString = val => {
  return val && val.toDate
    ? val.toDate().toISOString()
    : (Array.isArray(val)
      ? val.map(item => firestoreTimestampToISOString(item))
      : ((val && typeof val === 'object')
        ? Object.keys(val).reduce(
          (ret, cur) => ({
            ...ret,
            [cur]: firestoreTimestampToISOString(val[cur])
          }), ({}))
        : val
      )
    )
}

/**
 * { id, data() } => { id, ...data }
 * Firestore Timestamp => Date
 */
const castDoc = doc => ({
  _ref: doc.ref,
  id: doc.id,
  ...firestoreTimestampToISOString(doc.data())
})

const throwUnauthenticated = (msg, uid) => {
  warn('unauthenticated: ' + msg + ' uid: ' + uid)
  throw new functions.https.HttpsError('unauthenticated', msg + ' uid: ' + uid)
}

const throwPermissionDenied = (msg, uid) => {
  warn('permission-denied: ' + msg + ' uid: ' + uid)
  throw new functions.https.HttpsError('permission-denied', msg + ' uid: ' + uid)
}

const throwErrorDataLoss = (proc, data, err) => {
  error('data-loss', proc, JSON.stringify(data), err.message, err.details)
  throw new functions.https.HttpsError('data-loss', err.message, err.details)
}

module.exports = {
  firestoreTimestampToISOString,
  castDoc,
  throwUnauthenticated,
  throwPermissionDenied,
  throwErrorDataLoss
}
