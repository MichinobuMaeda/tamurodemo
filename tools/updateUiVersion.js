const firebase = require("firebase/app")
require("firebase/firestore")

Promise.resolve(firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STRAGE_BUCKET,
  messagingSenderId: process.env.MESSAGEING_SENDER_ID,
  appId: process.env.APP_ID
}).firestore()).then(
  function (db) {
    return db.collection('service').doc('status').update({ version: require('./version.json') })
  }
)
