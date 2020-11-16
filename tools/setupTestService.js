process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

const admin = require('firebase-admin')
const { updateService } = require('../functions/service')
const accounts = require('../functions/accounts')

const projectId = 'tamuro-test01'
const name = 'Primary User'
const email = 'primary@example.com'
const password = 'password'
const apiKey = 'api_key'

admin.initializeApp({ projectId })

const db = admin.firestore()
const auth = admin.auth()
const context = { db, auth }

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

const setupService = async () => {
  await clearDb()
  await updateService(context)

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
  const { id } = await accounts.createAccount({ name }, context)
  await accounts.setEmail({ id, email }, context)
  await accounts.setPassword({ id, password }, context)
  console.log(`Add memeber: accounts.${id} to groups.admins`)
  await db.collection('groups').doc('admins').update({
    members: [id]
  })
  console.log(`Add memeber: accounts.${id} to groups.managers`)
  await db.collection('groups').doc('managers').update({
    members: [id]
  })
  return null
}

setupService()
  .then(() => {
    console.log('complete')
    return deleteApp()
  })
  .catch(e => {
    console.error(e)
    return deleteApp()
  })
