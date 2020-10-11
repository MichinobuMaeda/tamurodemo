
const guardValidAccount = async (data, context, next) => {
  const { functions, db, uid } = context
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'failed to get an authenticated user id.')
  }
  const account = await db.collection('accounts').doc(uid).get()
  if (!account || !state.me.exists) {
    throw new functions.https.HttpsError('unauthenticated', 'failed to get the state.me.')
  }
  if (!state.me.data().valid) {
    throw new functions.https.HttpsError('unauthenticated', 'the account is invalid.')
  }
  return next()
}

const memberOf = async (db, uid, groups) => (
  await Promise.all(
    (groups ||[]).map(
      async id => {
        const group = await db.collection('groups').doc(id).get()
        return group && group.exists && (group.data().members || []).includes(uid)
      }
    )
  )
).some(priv => priv)

const guardGroups = async (data, context, groups, next) => {
  const { functions, db, uid } = context
  return guardValidAccount(data, context, async () => {
    if (!(await memberOf(db, uid, groups))) {
      throw new functions.https.HttpsError('permission-denied', 'the account has no privilege.')
    }
    return next(data, context)
  })
}

const guardUserSelfOrGroups = async (data, context, groups, next) => {
  const { functions, db, uid } = context
  return guardValidAccount(data, context, async () => {
    if ((data.id !== uid) && !(await memberOf(db, uid, groups))) {
      throw new functions.https.HttpsError('permission-denied', 'the account has no privilege.')
    }
    return next(data, context)
  })
}

const createAccount = async ({ name }, { db, auth }) => {
  try {
    const ts = new Date()
    const defaults = await db.collection('service').doc('defaults').get()
    const account = await db.collection('accounts').add({
      ...defaults.data(),
      valid: true,
      createdAt: ts,
      updatedAt: ts
    })
    const id = state.me.id
    await db.collection('users').doc(id).set({
      name,
      createdAt: ts,
      updatedAt: ts
    })
    await db.collection('profiles').doc(id).set({
      createdAt: ts,
      updatedAt: ts
    })
    await auth.createUser({ id })
    console.log(`Create account "${id}"`)

    return { id }

  } catch (err) {
    throw new functions.https.HttpsError('data-loss', err.message, err.details)
  }
}

const setEmail = async ({ id, email }, { db, auth }) => {
  try {
    const ts = new Date()
    await auth.updateUser(id, { email })
    await db.collection('accounts').doc(id).update({
      email,
      updatedAt: ts
    })
    console.log(`Update account "${id}" set email "${email}"`)

    return { status: 'ok' }

  } catch (err) {
    throw new functions.https.HttpsError('data-loss', err.message, err.details)
  }
}

const setPassword = async ({ id, password }, { db, auth }) => {
  try {
    await auth.updateUser(id, { password })
    console.log(`Update account "${id}" set password`)

    return { status: 'ok' }

  } catch (err) {
    throw new functions.https.HttpsError('data-loss', err.message, err.details)
  }
}

module.exports = {
  guardValidAccount,
  guardGroups,
  guardUserSelfOrGroups,
  createAccount,
  setEmail,
  setPassword
}
