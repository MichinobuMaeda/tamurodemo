const { nanoid } = require('nanoid')
const crypto = require('crypto')
const {
  throwUnauthenticated
} = require('./utils')

const invite = async ({ id }, { db, uid }) => {
  const conf = await db.collection('service').doc('conf').get()
  const invitation = await nanoid()
  const hash = crypto.createHash('sha256')
  hash.update(conf.data().apiKey)
  hash.update(invitation)
  const invitedAs = hash.digest('hex')
  const invitedAt = new Date()
  const invitedBy = uid
  await db.collection('accounts').doc(id).update({ invitedAs, invitedAt, invitedBy })
  console.log('invite: ' + id)
  return { invitation }
}

const validateInvitation = async ({ invitation }, { db, auth }) => {
  const conf = await db.collection('service').doc('conf').get()
  const hash = crypto.createHash('sha256')
  hash.update(conf.data().apiKey)
  hash.update(invitation)
  const invitedAs = hash.digest('hex')
  const accounts = await db.collection('accounts').where('invitedAs', "==", invitedAs).get()
  if (!(accounts && accounts.docs && accounts.docs.length === 1)) {
    throwUnauthenticated('Invalid invitation code: ', invitation)
  }
  const account = accounts.docs[0]
  if (!account.invitedAt || account.invitedAt.toDate().getTime() < (new Date().getTime() - conf.data().invitationExpirationTime)) {
    throwUnauthenticated('Invitation expired: ', account.id)
  }
  const token = await auth.createCustomToken(account.id)
  console.log('create token for: ' + account.id)
  return { token }
}

module.exports = {
  invite,
  validateInvitation
}
