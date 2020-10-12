
const guardValidAccount = async (data, context, next) => {
  const { functions, db, uid } = context
  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'failed to get an authenticated user id.')
  }
  const account = await db.collection('accounts').doc(uid).get()
  if (!account || !account.exists) {
    throw new functions.https.HttpsError('unauthenticated', 'failed to get the state.me.')
  }
  if (!account.data().valid) {
    throw new functions.https.HttpsError('unauthenticated', 'the account is invalid.')
  }
  return next(data, context)
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

module.exports = {
  guardValidAccount,
  guardGroups,
  guardUserSelfOrGroups
}
