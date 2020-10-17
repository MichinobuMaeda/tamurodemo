const {
  version,
  db,
  auth,
  clearDb,
  testData,
} = require('./utils')
const {
  updateVersion
} = require('../../service')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await db.terminate()
})

test('updateVersion()' +
  ' get dist/version.json in hosting and set version of service/conf.', async () => {

  // run
  const version = await updateVersion({ db })

  // evaluate
  const conf = await db.collection('service').doc('conf').get()
  expect(version).toEqual(version)
  expect(conf.data().version).toEqual(version)
})
