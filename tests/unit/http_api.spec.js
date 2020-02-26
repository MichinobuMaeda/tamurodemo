import fs from 'fs';
import axios from  'axios'
import * as firebase from '@firebase/testing'
import 'firebase/firestore'

const funcConf = JSON.parse(fs.readFileSync('functions/.runtimeconfig.json'))

const firebaseApp = firebase.initializeTestApp({
  projectId: "tamuro-test01",
  auth: {
    uid: "testprimaryuser",
    email: "testprimaryuser@example.com"
  }
})

const db = firebaseApp.firestore()
db.settings({
  host: process.env.FIRESTORE_EMULATOR_HOST,
  ssl: false
})
const functions = firebaseApp.functions()
functions.useFunctionsEmulator("http://localhost:5001")

const funcUrl = 'http://localhost:5001/tamuro-test01/us-central1'

beforeEach(async () => {
  await axios.delete('http://' + process.env.FIRESTORE_EMULATOR_HOST + '/emulator/v1/projects/tamuro-test01/databases/(default)/documents')
})

test('HTTP GET /tamuro/setup/:initKey with invalid initKey', async () => {
  let result = await axios.get(`${funcUrl}/tamuro/setup/testtest`)
  expect(result.status).toEqual(200)
  expect(result.data).toEqual('status: error\n')
})

test('HTTP GET /tamuro/setup/:initKey', async () => {
  let result = await axios.get(`${funcUrl}/tamuro/setup/${funcConf.init.key}`)
  expect(result.status).toEqual(200)
  expect(result.data).toEqual('status: ok\n')

  let status = await db.collection('service').doc('status').get()
  expect(status.data()).toMatchObject({
    version: '0000000000'
  })

  let conf = await db.collection('service').doc('conf').get()
  expect(conf.data()).toMatchObject({
    locale: 'ja-jp',
    menuPosition: 'bottom-right',
    timezone: 'Asia/Tokyo',
    uploadMimeType: [
      'image/jpeg',
      'image/png'
    ],
    uploadSize: 1024 * 1024 * 100,
    privacyPolicy: 'Privacy policy'
  })

  expect(db.collection('service').doc('line').get()).rejects.toThrow()

  let top = await db.collection('groups').doc('top').get()
  expect(top.data()).toMatchObject({
    name: 'Tamuro',
    members: [],
    subGroups: [ 'admin', 'manager' ]
  })

  let admin = await db.collection('groups').doc('admin').get()
  expect(admin.data()).toMatchObject({
    name: 'System Administrator',
    members: [],
    subGroups: []
  })

  let managet = await db.collection('groups').doc('manager').get()
  expect(managet.data()).toMatchObject({
    name: 'Manager',
    members: [],
    subGroups: []
  })
})

test('HTTP GET /tamuro/initialize/:initKey with invalid initKey', async () => {
  let result = await axios.get(`${funcUrl}/tamuro/initialize/testest`)
  expect(result.status).toEqual(200)
  expect(result.data).toEqual('status: error\n')
})

test('HTTP GET /tamuro/setup/:initKey', async () => {
  let result = await axios.get(`${funcUrl}/tamuro/initialize/${funcConf.init.key}`)
  expect(result.status).toEqual(200)
  let data = result.data.trim().split('\n')
  expect(data[0]).toEqual('status: ok')
  expect(data[1]).toEqual('https://tamuro-test01.web.app/?v=0000000000&invitation=test_token_for_testprimaryuser')

  let status = await db.collection('service').doc('status').get()
  expect(status.data()).toMatchObject({
    version: '0000000000'
  })

  let conf = await db.collection('service').doc('conf').get()
  expect(conf.data()).toMatchObject({
    locale: 'ja-jp',
    menuPosition: 'bottom-right',
    timezone: 'Asia/Tokyo',
    uploadMimeType: [
      'image/jpeg',
      'image/png'
    ],
    uploadSize: 1024 * 1024 * 100,
    privacyPolicy: 'Privacy policy'
  })

  expect(db.collection('service').doc('line').get()).rejects.toThrow()

  let top = await db.collection('groups').doc('top').get()
  expect(top.data()).toMatchObject({
    name: 'Tamuro',
    members: [],
    subGroups: [ 'admin', 'manager' ]
  })

  let admin = await db.collection('groups').doc('admin').get()
  expect(admin.data()).toMatchObject({
    name: 'System Administrator',
    members: [ 'testprimaryuser' ],
    subGroups: []
  })

  let managet = await db.collection('groups').doc('manager').get()
  expect(managet.data()).toMatchObject({
    name: 'Manager',
    members: [ 'testprimaryuser' ],
    subGroups: []
  })
})

test('HTTP GET /tamuro/release/ui/:initKey with invalid initKey', async () => {
  let result = await axios.get(`${funcUrl}/tamuro/release/ui/testest`)
  expect(result.status).toEqual(200)
  expect(result.data).toEqual('status: error\n')
})

test('HTTP GET /tamuro/release/ui/:initKey', async () => {
  await axios.get(`${funcUrl}/tamuro/initialize/${funcConf.init.key}`)
  let result = await axios.get(`${funcUrl}/tamuro/release/ui/${funcConf.init.key}`)
  expect(result.status).toEqual(200)
  expect(result.data).not.toMatch(/version:\s0+\n/)
  expect(result.data).toMatch(/version:\s\S+\n/)
})
