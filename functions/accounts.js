const { throwErrorDataLoss } = require('./utils')

const createAccount = async ({ name }, { db, auth, logger }) => {
  let id
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
    id = account.id
    await db.runTransaction(async transaction => {
      const allRef = db.collection('groups').doc('all')
      const all = await transaction.get(allRef)
      await transaction.update(allRef, {
        members: [...(all.data().members || []), id],
        updatedAt
      })
      await transaction.set(db.collection('users').doc(id), {
        name,
        createdAt,
        updatedAt
      })
      await transaction.set(db.collection('profiles').doc(id), {
        createdAt,
        updatedAt
      })
      await auth.createUser({ uid: id })
      logger.log(`Create account "${id}"`)
    })
  } catch (err) {
    try {
      await db.collection('accounts').doc(id).delete()
    } finally {
      throwErrorDataLoss('createAccount', name, err)
    }
  }
  return { id }
}

const setEmail = async ({ id, email }, { db, auth, logger }) => {
  try {
    const updatedAt = new Date()
    await auth.updateUser(id, { email })
    await db.collection('accounts').doc(id).update({
      email,
      updatedAt
    })
    logger.log(`Update account "${id}" set email "${email}"`)
  } catch (err) {
    throwErrorDataLoss('setEmail', id, err)
  }
  return { status: 'ok' }
}

const setPassword = async ({ id, password }, { auth, logger }) => {
  try {
    await auth.updateUser(id, { password })
    logger.log(`Update account "${id}" set password`)
  } catch (err) {
    throwErrorDataLoss('setEmail', id, err)
  }
  return { status: 'ok' }
}

const resetUserAuth = async ({ id }, { db, auth, logger }) => {
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
    logger.log('Fail to delete account: ' + id)
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
