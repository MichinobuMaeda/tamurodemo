const prompts = require('prompts')
const admin = require('firebase-admin')
const preDeploy = require('../functions/preDeploy')

const serviceAccount = require('../tamuro-test01-firebase-adminsdk.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tamuro-test01.firebaseio.com'
})

const setupService = async () => {
  const db = admin.firestore()
  const ts = new Date()
  await preDeploy(db, ts)

  // Create primary user.
  const accounts = await db.collection('accounts').get()
  if (accounts.docs.length) {
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
  const defaults = await db.collection('service').doc('defaults').get()
  const user = await db.collection('accounts').add({
    name,
    email,
    admin: true,
    manager: true,
    ...defaults.data(),
    createdAt: ts,
    updatedAt: ts
  })
  console.log(`Create: accounts.${user.id}`)
  await admin.auth().createUser({
    uid: user.id,
    email,
    password
  })
}

setupService()
  .then(() => {
    console.log('complete')
  })
  .catch(e => {
    console.error(e)
  })
