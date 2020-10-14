// const path = require('path')
// const fs = require('fs')
const prompts = require('prompts')
const firebase = require('@firebase/testing')
const { updateService } = require('../functions/service')

const projectId = 'tamuro-test01'

// const accounts = require('../functions/accounts')

// const serviceAccount = require('../tamuro-test01-firebase-adminsdk.json')

const app = firebase.initializeAdminApp({
  projectId,
  databaseURL: 'http://localhost:8080'
})

firebase.clearFirestoreData({
  projectId
})

const setupService = async () => {
  const db = app.firestore()
  // const auth = admin.auth()
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
  //
  // // Create primary user.
  // if ((await db.collection('accounts').get()).docs.length) {
  //   return true
  // }
  // const { name, email, password } = await prompts([
  //   {
  //     type: 'text',
  //     name: 'name',
  //     message: 'Display name:',
  //     validate: value => /.{4}/.test(value) || 'The display name should be 4 characters or more.'
  //   },
  //   {
  //     type: 'text',
  //     name: 'email',
  //     message: 'E-mail:',
  //     validate: value => /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(value) || 'Please enter your email address in the correct format.'
  //   },
  //   {
  //     type: 'password',
  //     name: 'password',
  //     message: 'Password:',
  //     validate: value => /.{8}/.test(value) || 'The password name should be 4 characters or more.',
  //     hidden: true
  //   }
  // ])
  // const id = await accounts.createAccount({ name }, { db, auth })
  // if (email) {
  //   await accounts.setEmail({ id, email }, { db, auth })
  // }
  // if (password) {
  //   await accounts.setPassword({ id, password }, { db, auth })
  // }
  // console.log(`Add memeber: accounts.${id} to groups.admins`)
  // await db.collection('groups').doc('admins').update({
  //   members: admin.firestore.FieldValue.arrayUnion(id)
  // })
  // console.log(`Add memeber: accounts.${id} to groups.managers`)
  // await db.collection('groups').doc('managers').update({
  //   members: admin.firestore.FieldValue.arrayUnion(id)
  // })
}

setupService()
  .then(() => {
    console.log('complete')
  })
  .catch(e => {
    console.error(e)
  })
