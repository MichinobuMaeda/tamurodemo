const projectId = process.argv[2]

const path = require('path')
process.env.GCLOUD_PROJECT = projectId
process.env.FIREBASE_CONFIG = path.join(__dirname, '..', `${projectId}-firebase-adminsdk.json`)
const serviceAccount = require(process.env.FIREBASE_CONFIG)
const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${projectId}.firebaseio.com`
})

const workDir = path.join(__dirname, '..', 'work')
const backupDir = path.join(workDir, 'backup')
const authJson = path.join(backupDir, 'authentication.json')
const firestoreJson = path.join(backupDir, 'firestore.json')

module.exports = {
  admin,
  workDir,
  backupDir,
  authJson,
  firestoreJson
}
