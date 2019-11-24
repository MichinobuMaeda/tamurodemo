import Firebase from 'firebase'
import 'firebase/firestore'
import conf from '../conf'

const firebase = Firebase.initializeApp(conf.firebase)
const db = firebase.firestore()

const message = window.localStorage.getItem('message') ? JSON.parse(window.localStorage.getItem('message')) : { key: 'noMessage', params: {} }

export default {
  conf,
  firebase,
  db,
  loading: [ 'start' ],
  landingRoute: null,
  message,
  me: null,
  groups: [],
  accounts: [],
  users: [],
  profiles: {},
  service: {},
  unsubscribers: [],
  menuPosition: 'bottom-right'
}
