const { throwErrorDataLoss } = require('./utils')

const createAccount = async ({ name }, { db, auth }) => {
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
    await auth.createUser({ id })
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
    return { status: 'ok' }
  } catch (err) {
    throwErrorDataLoss('setEmail', id, err)
  }
}

const setPassword = async ({ id, password }, { auth }) => {
  try {
    await auth.updateUser(id, { password })
    console.log(`Update account "${id}" set password`)
    return { status: 'ok' }
  } catch (err) {
    throwErrorDataLoss('setEmail', id, err)
  }
}

module.exports = {
  createAccount,
  setEmail,
  setPassword
}
