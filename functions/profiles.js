const {
  firestoreTimestampToISOString
} = require('./utils')

const getProfile = async ({ id }, { db, uid }) => {
  const myGroups = async () => (await db.collection('groups').where('members', 'array-contains', uid).get())
    .docs.filter(group => !group.data().deletedAt).map(group => group.id)
  const {
    createdAt,
    updatedAt,
    hiddenAt,
    deletedAt,
    ...profile
  } = firestoreTimestampToISOString((await db.collection('profiles').doc(id).get()).data())
  const permitted = (profile.permittedUsers || []).includes(uid) ||
    (
      (profile.permittedGroups || []).length &&
      (await myGroups()).some(id => profile.permittedGroups.includes(id))
    )
  return {
    id,
    createdAt,
    updatedAt,
    hiddenAt,
    deletedAt,
    ...((hiddenAt || deletedAt)
      ? {}
      : Object.keys(profile).filter(key => key.slice(-2) === '_p')
        .filter(key => profile[key] === 'a' || (permitted && profile[key] === 'c'))
        .reduce((ret, cur) => ({
          ...ret,
          [cur]: profile[cur],
          [cur.slice(0, -2)]:
          profile[cur.slice(0, -2)]
        }), {})
    )
  }
}

module.exports = {
  getProfile
}
