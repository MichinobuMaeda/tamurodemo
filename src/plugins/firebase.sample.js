import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/auth'

const firebase = Firebase.initializeApp({
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'tamuro-test01.firebaseapp.com',
  databaseURL: 'https://tamuro-test01.firebaseio.com',
  projectId: 'tamuro-test01',
  storageBucket: 'tamuro-test01.appspot.com',
  messagingSenderId: '1051588852085',
  appId: '1:1051588852085:web:c88694ba93327e24137b3c'
})

const auth = firebase.auth()
const db = firebase.firestore()
const functions = firebase.functions()

if (location.hostname === 'localhost') {
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
  functions.useFunctionsEmulator(
    'http://localhost:5001'
  )
}

export default {
  auth,
  db,
  functions
}
