const { throwErrorDataLoss } = require('./utils')

const createAccount = async ({ name }, { db, FieldValue, auth }) => {
  if (!name) {
    throwErrorDataLoss('createAccount', name, err)
  }
  try {
    const ts = new Date()
    const createdAt = ts
    const updatedAt = ts
    const defaults = await db.collection('service').doc('defaults').get()
    const account = await db.collection('accounts').add({
      ...defaults.data(),
      messagingTokens: [],
      valid: true,
      createdAt,
      updatedAt
    })
    const id = account.id
    console.log({ id })
    await db.collection('users').doc(id).set({
      name,
      createdAt,
      updatedAt
    })
    await db.collection('profiles').doc(id).set({
      createdAt,
      updatedAt
    })
    await db.collection('groups').doc('all').set({
      members: FieldValue.arrayUnion(id),
      updatedAt
    })
    await auth.createUser({ uid: id })
    console.log(`Create account "${id}"`)

    return { id }

  } catch (err) {
    throwErrorDataLoss('createAccount', name, err)
  }
}

const setEmail = async ({ id, email }, { db, auth }) => {
  try {
    const ts = new Date()
    const updatedAt = ts
    await auth.updateUser(id, { email })
    await db.collection('accounts').doc(id).update({
      email,
      updatedAt
    })
    console.log(`Update account "${id}" set email "${email}"`)
  } catch (err) {
    throwErrorDataLoss('setEmail', id, err)
  }
  return { status: 'ok' }
}

const setPassword = async ({ id, password }, { auth }) => {
  try {
    await auth.updateUser(id, { password })
    console.log(`Update account "${id}" set password`)
  } catch (err) {
    throwErrorDataLoss('setEmail', id, err)
  }
  return { status: 'ok' }
}

const resetUserAuth = async ({ id }, { db, auth }) => {
  try {
    await db.collection('accounts').doc(id).update({
      email: null,
      line_me: null,
      yahoo_co_jp: null,
      mixi_jp: null,
      updatedAt: new Date()
    })
  } catch (err) {
    throwErrorDataLoss('resetUserAuth', id, err)
  }
  try {
    await auth.deleteUser(id)
  } catch (e) {
    console.log('Fail to delete account: ' + id)
  }
  await auth.createUser({ uid: id })
}

const rejectCreateUserWithoutAccount = async ({ uid }, { db, auth }) => {
  const account = await db.collection('accounts').doc(uid).get()
  if (!account || !account.exists) {
    await auth.deleteUser(uid)
  }
}

module.exports = {
  rejectCreateUserWithoutAccount,
  createAccount,
  setEmail,
  setPassword,
  resetUserAuth
}
