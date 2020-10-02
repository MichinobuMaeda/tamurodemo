const prompts = require('prompts')
const admin = require('firebase-admin')
const { updateService } = require('../functions/service')
const accounts = require('../functions/accounts')

const serviceAccount = require('../tamuro-test01-firebase-adminsdk.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tamuro-test01.firebaseio.com'
})

const setupService = async () => {
  const db = admin.firestore()
  const auth = admin.auth()
  await updateService(db)

  // set API Key.
  const serviceConfRef = db.collection('service').doc('conf')
  if (!(await serviceConfRef.get()).data().apiKey) {
    const { apiKey } = await prompts([
      {
        type: 'text',
        name: 'apiKey',
        message: 'Web API key:',
        validate: value => /.{10}/.test(value) || 'Required.'
      }
    ])
    await serviceConfRef.update({ apiKey })
  }

  // Create primary user.
  if ((await db.collection('accounts').get()).docs.length) {
    return true
  }
  const { name, email, password } = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'Display name:',
      validate: value => /.{4}/.test(value) || 'The display name should be 4 characters or more.'
    },
    {
      type: 'text',
      name: 'email',
      message: 'E-mail:',
      validate: value => /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(value) || 'Please enter your email address in the correct format.'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: value => /.{8}/.test(value) || 'The password name should be 4 characters or more.',
      hidden: true
    }
  ])
  const uid = await accounts.createAccount(db, auth, name)
  if (email) {
    await accounts.setEmail(db, auth, uid, email)
  }
  if (password) {
    await accounts.setPassword(db, auth, uid, password)
  }
  console.log(`Add memeber: accounts.${uid} to groups.admins`)
  await db.collection('groups').doc('admins').update({
    members: admin.firestore.FieldValue.arrayUnion(uid)
  })
  console.log(`Add memeber: accounts.${uid} to groups.managers`)
  await db.collection('groups').doc('managers').update({
    members: admin.firestore.FieldValue.arrayUnion(uid)
  })
}

setupService()
  .then(() => {
    console.log('complete')
  })
  .catch(e => {
    console.error(e)
  })
