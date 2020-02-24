import axios from  'axios'
// import Moment from 'moment-timezone'
import Firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/functions'
// import 'firebase/storage'
import conf from  '../../src/conf'

const firebase = Firebase.initializeApp(conf.firebase)
const db = firebase.firestore()
db.settings({
  host: process.env.FIRESTORE_EMULATOR_HOST,
  ssl: false
})
const functions = firebase.functions()
functions.useFunctionsEmulator("http://localhost:5001")

import index from '../../functions/index'

const funcUrl = 'http://localhost:5001/tamuro-test01/us-central1'
const initKey = process.env.FUNCTIONS_INIT_KEY

beforeEach(async () => {
  await axios.delete('http://' + process.env.FIRESTORE_EMULATOR_HOST + '/emulator/v1/projects/tamuro-test01/databases/(default)/documents')
})

test('test.', async () => {
  let result = await axios.get(`${funcUrl}/tamuro/setup/${initKey}`)
  expect(result.status).toEqual(200)
  expect(result.data).toEqual('status: ok')
})
