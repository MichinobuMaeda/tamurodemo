process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

const request = require('request-promise-native')
const firebase = require('@firebase/rules-unit-testing')
const { updateService } = require('../functions/service')
const { initialData } = require('../functions/initialData')
const accounts = require('../functions/accounts')

const projectId = 'tamuro01'
const password = 'password'
const apiKey = 'api_key'

const admin = firebase.initializeAdminApp({ projectId })

// Suspected emulator bug in M1
const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`

firebase.loadFirestoreRules({ projectId, rules })
const db = admin.firestore()
const auth = admin.auth()
const logger = console
const context = { db, auth, logger }

const clearAuth = async () => {
  await request({
    method: 'DELETE',
    uri: 'http://localhost:9099/emulator/v1/projects/tamuro01/accounts',
    headers: {
      Authorization: 'Bearer owner'
    }
  })
}

// const deleteApp = () => admin.app().delete()

const setupService = async () => {
  await clearAuth()
  await firebase.clearFirestoreData({ projectId })
  await updateService(context, initialData)

  // set API Key.
  const serviceConfRef = db.collection('service').doc('conf')
  if (!(await serviceConfRef.get()).data().apiKey) {
    console.log('Set: service.conf.apiKey')
    await serviceConfRef.update({ apiKey })
  }

  // Create primary user.
  if ((await db.collection('accounts').get()).docs.length) {
    return true
  }

  const creteAccount = async name => {
    const account = await accounts.createAccount({
      name: name.charAt(0).toUpperCase() + name.slice(1)
    }, context)
    await accounts.setEmail({
      id: account.id,
      email: `${name}@example.com`
    }, context)
    await accounts.setPassword({ id: account.id, password }, context)
    return account.id
  }

  const primary = await creteAccount('primary')
  const manager = await creteAccount('manager')
  const admin = await creteAccount('admin')
  const tester = await creteAccount('tester')
  const user01 = await creteAccount('user01')
  const user02 = await creteAccount('user02')
  const user03 = await creteAccount('user03')
  const user04 = await creteAccount('user04')
  const user05 = await creteAccount('user05')
  const invalid = await creteAccount('invalid')
  const deleted = await creteAccount('deleted')

  await db.collection('groups').doc('managers').update({
    members: [primary, manager]
  })
  await db.collection('groups').doc('admins').update({
    members: [primary, admin]
  })
  await db.collection('groups').doc('testers').update({
    members: [tester]
  })
  await db.collection('accounts').doc(invalid).update({
    valid: false
  })
  await db.collection('accounts').doc(deleted).update({
    deletedAt: new Date()
  })
  const group1 = await db.collection('groups').add({
    name: 'Group 1',
    members: [user01, user02, user03],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const group2 = await db.collection('groups').add({
    name: 'Group 2',
    members: [user01, user04, invalid, deleted],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const group3 = await db.collection('groups').add({
    name: 'Group 3',
    members: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  await db.collection('groups').add({
    name: 'Group deleted',
    members: [user05],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date()
  })
  await db.collection('categories').add({
    seq: 1,
    name: 'Category 1',
    groups: [group1.id, group3.id],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  await db.collection('categories').add({
    seq: 2,
    name: 'Category 2',
    groups: [group2.id],
    createdAt: new Date(),
    updatedAt: new Date()
  })
  await db.collection('categories').add({
    seq: 3,
    name: 'Privileged',
    groups: ['managers', 'admins'],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  return null
}

setupService()
  .then(() => {
    console.log('complete')
    // return deleteApp()
  })
  .catch(e => {
    console.error(e)
    // return deleteApp()
  })
