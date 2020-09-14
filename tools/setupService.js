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
  const account = await db.collection('accounts').add({
    email,
    ...defaults.data(),
    createdAt: ts,
    updatedAt: ts
  })
  const uid = account.id
  await db.collection('users').doc(uid).set({
    name,
    createdAt: ts,
    updatedAt: ts
  })
  await db.collection('profiles').doc(uid).set({
    createdAt: ts,
    updatedAt: ts
  })
  console.log(`Create: accounts.${uid}`)
  await admin.auth().createUser({
    uid,
    email,
    password
  })
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
