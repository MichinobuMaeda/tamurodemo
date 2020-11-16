import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/auth'
import 'firebase/messaging'
import apiKey from './firebase-api-key.js'

export const firebase = Firebase.initializeApp({
  apiKey,
  authDomain: 'tamuro-test01.firebaseapp.com',
  databaseURL: 'https://tamuro-test01.firebaseio.com',
  projectId: 'tamuro-test01',
  storageBucket: 'tamuro-test01.appspot.com',
  messagingSenderId: '1051588852085',
  appId: '1:1051588852085:web:c88694ba93327e24137b3c'
})

export const auth = firebase.auth()
export const db = firebase.firestore()
export const functions = firebase.functions()
export const messaging = firebase.messaging()
export const webPushCertificateKey = 'BPZ_fdPSU__DSq7IDD5cK6DlPUd4iEqQfuMEfXb7cHZnNsTzOTRFW5EW9lnd6Dnso1-0fulRxXsaPWcJhL0n0_4'
export const FieldValue = Firebase.firestore.FieldValue

console.log('ui', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  auth.useEmulator('http://localhost:9099/')
  db.useEmulator('localhost', 8080)
  functions.useEmulator('localhost', 5001)
}
