const path = require('path')
const admin = require('firebase-admin')
const fs = require('fs')
const { initialData } = require('../../../functions/initialData')
const { updateService } = require('../../../functions/service')

const projectId = 'tamuro02'
const apiKey = 'test-api-key'
const primary = 'primary'
const version = 'testver01'
const hostingPath = path.join(__dirname, '..', '..', '..', 'dist')
const logger = console

if (!fs.existsSync(hostingPath)) {
  fs.mkdirSync(hostingPath)
}
fs.writeFileSync(
  path.join(hostingPath, 'version.json'),
  `{"version":"${version}"}`
)

admin.initializeApp({ projectId })

const db = admin.firestore()

const clearDb = async () => {
  const getDocRefs = async parent => {
    const docRefs = []
    const collections = (await parent.listCollections()).map(collection => collection.id)
    const result = await Promise.all(
      collections.map(collection => db.collection(collection).listDocuments())
    )
    result.forEach(refs => { refs.forEach(ref => { docRefs.push(ref) }) })
    await Promise.all(
      docRefs.map(async ref => {
        (await getDocRefs(ref)).forEach(ref => {
          docRefs.push(ref)
        })
      })
    )
    return docRefs
  }
  const docRefs = await getDocRefs(db)
  await Promise.all(docRefs.map(ref => ref.delete()))
}

const deleteApp = () => admin.app().delete()

const auth = {
  error: false,
  data: {},
  clear () {
    this.error = false
    this.data = {}
  },
  createCustomToken: uid => `token for ${uid}`,
  createUser (userData) {
    const { uid, ...data } = userData
    if (this.error) {
      this.error = false
      throw new Error('something bad happened')
    }
    this.data[uid] = { ...data }
  },
  updateUser (uid, data) {
    if (this.error) {
      this.error = false
      throw new Error('something bad happened')
    }
    this.data[uid] = { ...this.data[uid], ...data }
  },
  deleteUser (uid) {
    if (!this.data[uid]) {
      throw Error('')
    }
    delete this.data[uid]
  }
}

const messaging = {
  error: false,
  data: {},
  clear () {
    this.error = false
    this.data = {}
  },
  sendMulticast (message) {
    this.data.message = message
  }
}

const testData = async () => {
  await updateService({ db, logger }, initialData)
  await db.collection('service').doc('conf').update({
    apiKey,
    invitationExpirationTime: 60 * 1000,
    hosting: 'http://localhost:5000'
  })
  await db.collection('accounts').doc(primary).set({ valid: true })
  await db.collection('groups').doc('all').update({
    members: [primary]
  })
  await db.collection('groups').doc('admins').update({
    members: [primary]
  })
  await db.collection('groups').doc('managers').update({
    members: [primary]
  })
}

module.exports = {
  projectId,
  apiKey,
  primary,
  version,
  db,
  auth,
  messaging,
  logger,
  clearDb,
  deleteApp,
  testData
}
