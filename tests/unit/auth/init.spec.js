import {
  auth,
  deleteApp,
  store
} from '../utils'
import { signOut } from '../../../src/auth/init'

beforeEach(async () => {
  store.auth.clear()
  store.functions.clear()
})

afterAll(async () => {
  await deleteApp()
})

test('signOut()' +
  ' should call auth.signOut().', async () => {
  // prepare

  // run
  await signOut({ auth })

  // evaluate
  expect(auth.data.signOut.called).toBeTruthy()
})
