var admin = require('firebase-admin')
var serviceAccount = require(`./keys/${process.env.PROJECT_ID}-firebase.json`)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
})

Promise.resolve(process.env.PROJECT_ID).then(project => {
  const firestore = admin.firestore()
  return firestore.getCollections()
    .then(collections => {
      let tasks = []
      for (let collection of collections) {
        collection.get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            tasks.push(collection.doc(doc.id).delete())
          })
        })
      }
      return Promise.all(tasks).then(() => {
        console.log('done.')
      })
    })
})
