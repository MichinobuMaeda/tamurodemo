var admin = require('firebase-admin')
var serviceAccount = require(`./keys/${process.env.PROJECT_ID}-firebase.json`)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.PROJECT_ID}.firebaseio.com`
})

process.stdin.resume()
process.stdin.setEncoding('utf8')

let text = ''

process.stdin.on('data', function (chunk) {
  text += chunk
})

process.stdin.on('end', function () {
  let data = JSON.parse(text)
  Promise.resolve(process.env.PROJECT_ID).then(project => {
    const firestore = admin.firestore()
    let tasks = []
    for (let name of Object.keys(data)) {
      let collectionRef = firestore.collection(name)
      for (let id of Object.keys(data[name])) {
        for (let key of Object.keys(data[name][id])) {
          if (key === 'createdAt' || key === 'updatedAt') {
            data[name][id][key] = data[name][id][key] ? new Date(data[name][id][key]) : null
          }
        }
        tasks.push(collectionRef.doc(id).set(data[name][id]))
      }
    }
    return Promise.all(tasks).then(() => true)
  })
})
