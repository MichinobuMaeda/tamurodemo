const { nanoid } = require('nanoid')
const crypto = require('crypto')

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
  return { invitation }
}

const validateInvitation = async ({ invitation }, { db, auth }) => {
  const conf = await db.collection('service').doc('conf').get()
  const hash = crypto.createHash('sha256')
  hash.update(conf.data().apiKey)
  hash.update(key)
  const invitedAs = hash.digest('hex')
  const accounts = await db.collection('accounts').where('invitedAs', "==", invitedAs).get().docs
  if (accounts.length !== 1) {
    return { status: 'Error: invalid invitation code.' }
  }
  const account = accounts[0]
  const token = await auth.createCustomToken(account.id)
  return { token }
}

module.exports = {
  invite,
  validateInvitation
}
