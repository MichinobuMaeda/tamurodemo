const path = require('path')
const admin = require('firebase-admin')

const projectId = 'tamuro02'
process.env.GCLOUD_PROJECT = projectId
process.env.FIREBASE_CONFIG = path.join(__dirname, '..', 'firebase-adminsdk.json')
const serviceAccount = require(process.env.FIREBASE_CONFIG)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${projectId}.appspot.com`
})

const prefix = process.argv[2] ? `${process.argv[2]}_` : ''

const workDir = path.join(__dirname, '..', 'work')
const backupDir = path.join(workDir, 'backup')
const authJson = path.join(backupDir, `${prefix}authentication.json`)
const firestoreJson = path.join(backupDir, `${prefix}firestore.json`)

module.exports = {
  admin,
  workDir,
  backupDir,
  authJson,
  firestoreJson
}
