import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/auth'
import 'firebase/messaging'
import apiKey from './firebase-api-key.js'

export const firebase = Firebase.initializeApp({
  apiKey,
  authDomain: 'tamuro01.firebaseapp.com',
  projectId: 'tamuro01',
  storageBucket: 'tamuro01.appspot.com',
  messagingSenderId: '476623795624',
  appId: '1:476623795624:web:0fce0105822bc7908cd99d'
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
