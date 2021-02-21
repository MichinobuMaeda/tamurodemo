const {
  apiKey,
  db,
  auth,
  clearDb,
  deleteApp,
  testData
} = require('./_testUtils')
const {
  apiKeyValidator
} = require('../../../functions/api')

beforeEach(async () => {
  auth.clear()
  await clearDb()
  await testData()
})

afterAll(async () => {
  await clearDb()
  await deleteApp()
})

test('apiKeyValidator()' +
  ' accepts valid api key.', async () => {
  // prepare
  const callMe = { count: 0 }
  const req = { query: { key: apiKey } }
  const res = {
    send () { throw new Error("Don't call me") }
  }
  const next = () => { ++callMe.count }

  // run
  await apiKeyValidator({ db })(req, res, next)

  // evaluate
  expect(callMe.count).toEqual(1)
})

test('apiKeyValidator()' +
  ' rejects no api key.', async () => {
  // prepare
  const callMe = { count: 0, status: null }
  const req = { query: {} }
  const res = {
    status (code) { callMe.status = code },
    send () { ++callMe.count }
  }
  const next = () => { throw new Error("Don't call me") }

  // run
  await apiKeyValidator({ db })(req, res, next)

  // evaluate
  expect(callMe.count).toEqual(1)
  expect(callMe.status).toEqual(401)
})

test('apiKeyValidator()' +
  ' rejects invalid api key.', async () => {
  // prepare
  const callMe = { count: 0, status: null }
  const req = { query: { key: 'invalid api key' } }
  const res = {
    status (code) { callMe.status = code },
    send () { ++callMe.count }
  }
  const next = () => { throw new Error("Don't call me") }

  // run
  await apiKeyValidator({ db })(req, res, next)

  // evaluate
  expect(callMe.count).toEqual(1)
  expect(callMe.status).toEqual(401)
})
