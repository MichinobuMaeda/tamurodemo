import Firebase from 'firebase/app'
import 'firebase/firestore'
import conf from '../src/conf'

Promise.resolve(Firebase.initializeApp(conf.firebase).firestore()).then(
  db => db.collection('service').doc(status).update({
    version: conf.version
  })
)
