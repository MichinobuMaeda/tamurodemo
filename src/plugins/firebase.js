import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/auth'
// Disabled for Safari: 2021-02-27 // import 'firebase/messaging'
import apiKey from './firebase-api-key.js'

export const firebase = Firebase.initializeApp({
  apiKey,
  authDomain: 'tamuro01.firebaseapp.com',
  projectId: 'tamuro01',
  storageBucket: 'tamuro01.appspot.com',
  messagingSenderId: '476623795624',
  appId: '1:476623795624:web:0fce0105822bc7908cd99d',
  measurementId: 'G-E3ML2Q9BVM'
})

export const auth = firebase.auth()
export const db = firebase.firestore()
export const functions = firebase.functions()

// Disabled for Safari: 2021-02-27 // export const messaging = firebase.messaging()
export const webPushCertificateKey = 'BKkzKdvIWlIy4FmHSxbrHMmuDICaY1gvP-GcHscMci_E6m5gH_cImPAnRYN6IaaA66JNiAI3_PwE9IQQ1EpSWDk'
export const FieldValue = Firebase.firestore.FieldValue

console.log('ui', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  auth.useEmulator('http://localhost:9099/')
  db.useEmulator('localhost', 8080)
  functions.useEmulator('localhost', 5001)
}
