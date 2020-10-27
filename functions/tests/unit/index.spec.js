const myFunctions = require('../../index')

test('index.js exports functions.', async () => {
  expect(Object.keys(myFunctions)).toContain('api')
  expect(Object.keys(myFunctions)).toContain('createAccount')
  expect(Object.keys(myFunctions)).toContain('setEmail')
  expect(Object.keys(myFunctions)).toContain('setPassword')
  expect(Object.keys(myFunctions)).toContain('invite')
  expect(Object.keys(myFunctions)).toContain('validateInvitation')
  expect(Object.keys(myFunctions)).toContain('setEmailWithInvitation')
  expect(Object.keys(myFunctions)).toContain('setEmailAndPasswordWithInvitation')
  expect(Object.keys(myFunctions)).toContain('resetUserAuth')
  expect(Object.keys(myFunctions)).toContain('rejectCreateUserWithoutAccount')
})
