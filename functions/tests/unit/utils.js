const path = require('path')
const fs = require('fs')
const firebase = require('@firebase/testing')
const { updateService } = require('../../service')

const projectId = 'tamuro-test01'
const apiKey = 'test-api-key'
const admin01 = 'admin01'
const version = 'testver01'
const hostingPath = path.join(__dirname, '..', '..', '..', 'dist')
process.env.GCLOUD_PROJECT = projectId

if (!fs.existsSync(hostingPath)) {
  fs.mkdirSync(hostingPath)
}
fs.writeFileSync(
  path.join(hostingPath, 'version.json'),
  `{"version":"${version}"}`
)

const app = firebase.initializeAdminApp({
  projectId,
  databaseURL: 'http://localhost:8080'
})

const db = app.firestore()

const clearDb = () => firebase.clearFirestoreData({
  projectId
})

const auth = {
  error: false,
  data: {},
  clear() {
    this.error = false
    this.data = {}
  },
  createCustomToken: id => `token for ${id}`,
  createUser(userData) {
    const { id, ...data } = userData
    if (this.error) {
      this.error = false
      throw new Error('something bad happened')
    }
    this.data[id] = { ...data }
  },
  updateUser(id, data) {
    if (this.error) {
      this.error = false
      throw new Error('something bad happened')
    }
    this.data[id] = { ...this.data[id], ...data }
  }
}

const testData = async () => {
  await updateService({ db })
  await db.collection('service').doc('conf').update({
    apiKey,
    invitationExpirationTime: 60 * 1000,
    hosting: 'http://localhost:5000'
  })
  await db.collection('accounts').doc(admin01).set({ valid: true })
  await db.collection('groups').doc('admins').update({
    members: [admin01]
  })
  await db.collection('groups').doc('managers').update({
    members: [admin01]
  })
}

module.exports = {
  projectId,
  apiKey,
  admin01,
  version,
  firestore: firebase.firestore,
  db,
  auth,
  clearDb,
  testData
}
