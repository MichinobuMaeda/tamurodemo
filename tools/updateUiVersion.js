const firebase = require("firebase/app")
require("firebase/firestore")
const conf = require('../src/conf')

Promise.resolve(firebase.initializeApp(conf.firebase).firestore()).then(
  db => db.collection('service').doc(status).update({
    version: conf.version
  })
)
