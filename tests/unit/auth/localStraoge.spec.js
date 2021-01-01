import {
  setFakeWindow,
  deleteApp
} from '../utils'
import {
  LS_REQ_EMAIL,
  storeRequestedEmail,
  restoreRequestedEmail,
  eraseRequestedEmail,
  LS_REQ_ROUTE,
  storeRequestedRoute,
  restoreRequestedRoute,
  eraseRequestedRoute
} from '../../../src/auth/localStrage'

beforeEach(async () => {
  setFakeWindow()
})

afterAll(async () => {
  await deleteApp()
})

test('storeRequestedEmail()' +
  ' should set given value to LS_REQ_EMAIL.', async () => {
  // prepare
  const email = 'abc@example.com'

  // run
  storeRequestedEmail(email)

  // evaluate
  expect(window.localStorage.data[LS_REQ_EMAIL]).toEqual(email)
})

test('restoreRequestedEmail()' +
  ' should get stored value of LS_REQ_EMAIL.', async () => {
  // prepare
  const email = 'abc@example.com'
  storeRequestedEmail(email)

  // run
  const ret = restoreRequestedEmail()

  // evaluate
  expect(ret).toEqual(email)
})

test('eraseRequestedEmail()' +
  ' should set empty string to LS_REQ_EMAIL.', async () => {
  // prepare
  const email = 'abc@example.com'
  storeRequestedEmail(email)

  // run
  eraseRequestedEmail()

  // evaluate
  expect(window.localStorage.data[LS_REQ_EMAIL]).toEqual('')
})

test('storeRequestedRoute()' +
  ' should set given value as JSON to LS_REQ_ROUTE.', async () => {
  // prepare
  const route = {
    name: 'route1',
    params: { param1: 'value1' }
  }

  // run
  storeRequestedRoute(route)

  // evaluate
  expect(JSON.parse(window.localStorage.data[LS_REQ_ROUTE])).toEqual(route)
})

test('restoreRequestedRoute()' +
  ' should get stored value and set empty string to LS_REQ_ROUTE.', async () => {
  // prepare #0
  const route = {
    name: 'route1',
    params: { param1: 'value1' }
  }

  // run #0
  const ret0 = restoreRequestedRoute()

  // evaluate #0
  expect(ret0).toBeNull()

  // prepare #1
  storeRequestedRoute(route)

  // run #1
  const ret1 = restoreRequestedRoute()

  // evaluate #1
  expect(ret1).toEqual(route)

  // prepare #2
  window.localStorage.data[LS_REQ_ROUTE] = '{ invalid JSON data'

  // run #2
  const ret2 = restoreRequestedRoute()

  // evaluate #1
  expect(ret2).toBeNull()
})

test('eraseRequestedRoute()' +
  ' should set "null" to LS_REQ_ROUTE.', async () => {
  // prepare
  const route = {
    name: 'route1',
    params: { param1: 'value1' }
  }
  storeRequestedRoute(route)

  // run
  eraseRequestedRoute()

  // evaluate
  expect(restoreRequestedRoute()).toBeNull()
})
