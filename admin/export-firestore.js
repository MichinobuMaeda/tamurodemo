var stringify = require('json-stable-stringify')
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
      let all = {}
      let tasks = []
      for (let collection of collections) {
        all[collection.id] = {}
        tasks.push(
          collection.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
              all[collection.id][doc.id] = doc.data()
            })
          })
        )
      }
      return Promise.all(tasks).then(() => {
        console.log(stringify(all, {space: 3}))
      })
    })
})
