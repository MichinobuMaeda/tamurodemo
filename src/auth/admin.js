export const resetAllSignInSettings = ({ functions }, id) =>
  functions.httpsCallable('resetUserAuth')({ id })
