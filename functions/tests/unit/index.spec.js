const myFunctions = require('../../index')

test('index.js exports functions except test settings.', async () => {
  expect(Object.keys(myFunctions)).toContain('api')
  expect(Object.keys(myFunctions)).toContain('createAccount')
  expect(Object.keys(myFunctions)).not.toContain('handleUpdateServiceVersion')
  expect(Object.keys(myFunctions)).not.toContain('handleValidateInvitation')
})
