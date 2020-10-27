const { nanoid } = require('nanoid')
const crypto = require('crypto')
const { throwUnauthenticated } = require('./utils')
const { setEmail, setPassword }  = require('./accounts')

const hashInvitation = (apiKey, invitation) => {
  const hash = crypto.createHash('sha256')
  hash.update(apiKey)
  hash.update(invitation)
  return hash.digest('hex')
}

// id: invitee
// uid: inviter
const invite = async ({ id }, { db, uid }) => {
  const conf = await db.collection('service').doc('conf').get()
  const invitation = await nanoid()
  const invitedAs = hashInvitation(conf.data().apiKey, invitation)
  const invitedAt = new Date()
  const invitedBy = uid
  await db.collection('accounts').doc(id).update({ invitedAs, invitedAt, invitedBy })
  console.log('invited ' + id + ' by ' + invitedBy)
  return { invitation }
}

// get invitee, check expiration
const invitedAccount = async ({ invitation }, { db }) => {
  const conf = await db.collection('service').doc('conf').get()
  const invitedAs = hashInvitation(conf.data().apiKey, invitation)
  const accounts = await db.collection('accounts').where('invitedAs', "==", invitedAs).get()
  if (!(accounts && accounts.docs && accounts.docs.length === 1)) {
    throwUnauthenticated('Invalid invitation code: ', invitation)
  }
  const account = accounts.docs[0]
  if (
    !account.data().invitedAt ||
    account.data().invitedAt.toDate().getTime() < (new Date().getTime() - conf.data().invitationExpirationTime)
  ) {
    await db.collection('accounts').doc(account.id).update({ invitedAs: null })
    throwUnauthenticated(
      'Invitation expired: ',
      account.id,
      account.data().invitedAt.toDate().getTime(),
      new Date().getTime(),
      conf.data().invitationExpirationTime
    )
  }
  return account
}

const validateInvitation = async ({ invitation }, { db, auth }) => {
  const account = await invitedAccount({ invitation }, { db })
  const token = await auth.createCustomToken(account.id)
  console.log('create token for: ' + account.id)
  return { token }
}

const setEmailAndPasswordWithInvitation = async (
  { invitation, email, password },
  { db, auth, uid }
) => {
  const account = await invitedAccount({ invitation }, { db })
  const id = account.id
  if (id !== uid) {
    throwUnauthenticated('Account has not invited: ', invitation, id, uid)
  }
  const result = await setEmail({ id, email }, { db, auth })
  return password ? setPassword({ id, password }, { db, auth }) : result
}

const setEmailWithInvitation = async ({ invitation, email }, context) =>
  setEmailAndPasswordWithInvitation({ invitation, email }, context)

module.exports = {
  invite,
  validateInvitation,
  setEmailWithInvitation,
  setEmailAndPasswordWithInvitation
}
