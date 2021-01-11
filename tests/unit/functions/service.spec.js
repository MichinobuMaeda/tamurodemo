const {
  db,
  auth,
  logger,
  clearDb,
  deleteApp,
  testData,
  version
} = require('./utils')
const {
  initialData
} = require('../../../functions/initialData')
const {
  updateService,
  updateVersion
} = require('../../../functions/service')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('updateService()' +
  ' create required documents and properties but not overwrite.', async () => {
  // prepare
  await db.collection('service').doc('defaults').delete()
  await db.collection('service').doc('defaults').set({
    tz: 'US/Hawaii'
  })
  await db.collection('groups').doc('managers').delete()

  // run
  await updateService({ db, logger }, initialData)

  // evaluate
  const defaults = await db.collection('service').doc('defaults').get()
  const managers = await db.collection('groups').doc('managers').get()
  expect(defaults.data().tz).toEqual('US/Hawaii')
  expect(defaults.data().locale).toEqual('ja_JP')
  expect(managers.exists).toBeTruthy()
})

test('updateVersion()' +
  ' get dist/version.json in hosting and set version of service/conf.', async () => {
  // prepare
  await db.collection('service').doc('conf').update({
    version: '0000000000'
  })

  // #1 run
  const version1 = await updateVersion({ db, logger })

  // #1 evaluate
  const conf1 = await db.collection('service').doc('conf').get()
  expect(version1).toEqual(version)
  expect(conf1.data().version).toEqual(version)

  // #2 run
  const version2 = await updateVersion({ db, logger })

  // #3 evaluate
  const conf2 = await db.collection('service').doc('conf').get()
  expect(version2).toEqual(version)
  expect(conf2.data().version).toEqual(version)
})
