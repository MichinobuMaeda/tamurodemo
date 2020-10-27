import { functions } from '../utils'
import { resetAllSignInSettings } from '../../../src/auth/admin'

test('resetAllSignInSettings()' +
  ' should call "resetUserAuth" with given id.', async () => {
  // prepare
  const id = 'account01'
  functions.results.resetUserAuth = 'ok'

  // run
  const result = await resetAllSignInSettings({ functions }, id)

  // evaluate
  expect(result).toEqual('ok')
  expect(functions.inputs.resetUserAuth.id).toEqual(id)
})
