import Firebase from 'firebase'
import 'firebase/firestore'
import conf from '../conf'

const firebase = Firebase.initializeApp(conf.firebase)
const db = firebase.firestore()

export default {
  conf,
  firebase,
  db,
  loading: true,
  me: null,
  groups: [],
  accounts: [],
  users: [],
  profiles: {},
  service: {},
  unsubscribers: []
}
