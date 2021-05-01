import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/messaging'
import apiKey from './firebase-api-key.js'

export const firebase = Firebase.initializeApp({
  apiKey,
  authDomain: 'tamuro02.firebaseapp.com',
  projectId: 'tamuro02',
  storageBucket: 'tamuro02.appspot.com',
  messagingSenderId: '971696972960',
  appId: '1:971696972960:web:956b7a27ca9358392895c5',
  measurementId: 'G-M64LRER4GD'
})

const region = 'asia-northeast2'

export const auth = firebase.auth()
export const db = firebase.firestore()
export const functions = firebase.functions(region)
export const storage = firebase.storage()

export const messaging = Firebase.messaging.isSupported() ? firebase.messaging() : null
export const webPushCertificateKey = 'BEbbIvxzQm-efQgu9oLrbgZbzObBd8CiCebrZOh21vAtbIBVLukRnyk6eFPtG13uUtYbojGXWWh_iimLzhnAvTI'
export const FieldValue = Firebase.firestore.FieldValue

console.log('ui', process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  auth.useEmulator('http://localhost:9099/')
  db.useEmulator('localhost', 8080)
  functions.useEmulator('localhost', 5001)
}
