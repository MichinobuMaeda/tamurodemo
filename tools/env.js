const path = require('path')
const admin = require('firebase-admin')

const projectId = 'tamuro01'
process.env.GCLOUD_PROJECT = projectId
process.env.FIREBASE_CONFIG = path.join(__dirname, '..', 'firebase-adminsdk.json')
const serviceAccount = require(process.env.FIREBASE_CONFIG)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${projectId}.appspot.com`
})

const suffix = process.argv[2] ? `${process.argv[2]}_` : ''

const workDir = path.join(__dirname, '..', 'work')
const backupDir = path.join(workDir, 'backup')
const authJson = path.join(backupDir, `${suffix}authentication.json`)
const firestoreJson = path.join(backupDir, `${suffix}firestore.json`)

module.exports = {
  admin,
  workDir,
  backupDir,
  authJson,
  firestoreJson
}
