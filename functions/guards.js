const {
  throwUnauthenticated,
  throwPermissionDenied
} = require('./utils')

const guardValidAccount = async (data, context, next) => {
  const { db, uid } = context
  if (!uid) {
    throwUnauthenticated('failed to get an authenticated user id.')
  }
  const account = await db.collection('accounts').doc(uid).get()
  if (!account || !account.exists) {
    throwUnauthenticated('failed to get the account.', uid)
  }
  if (!account.data().valid) {
    throwUnauthenticated('the account is invalid.', uid)
  }
  return next(data, context)
}

const memberOf = async (db, uid, groups) => (
  await Promise.all(
    groups.map(
      async id => {
        const group = await db.collection('groups').doc(id).get()
        return group && group.exists && !group.data().deletedAt &&
          group.data().members && group.data().members.includes(uid)
      }
    )
  )
).some(priv => priv)

const guardGroups = async (data, context, groups, next) => {
  const { db, uid } = context
  return guardValidAccount(data, context, async () => {
    if (!(await memberOf(db, uid, groups))) {
      throwPermissionDenied('the account has no privilege.', uid)
    }
    return next(data, context)
  })
}

const guardUserSelfOrGroups = async (data, context, groups, next) => {
  const { db, uid } = context
  return guardValidAccount(data, context, async () => {
    if ((data.id !== uid) && !(await memberOf(db, uid, groups))) {
      throwPermissionDenied('the account has no privilege.', uid)
    }
    return next(data, context)
  })
}

module.exports = {
  guardValidAccount,
  guardGroups,
  guardUserSelfOrGroups
}
