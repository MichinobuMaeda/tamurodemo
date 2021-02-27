const axios = require('axios')
const crypto = require('crypto')
const querystring = require('querystring')

// HTTP Callable API: on Sing in with LINE
const signInWithLine = async (req, { db, auth, logger }) => {
  // Get client secret.
  const params = (await db.collection('service').doc('auth').get()).data()

  // Get access token.
  const acc = await axios.post(params.line_me_token_url, querystring.stringify({
    grant_type: params.line_me_grant_type,
    code: req.code,
    redirect_uri: req.redirect_uri,
    client_id: params.line_me_client_id,
    client_secret: params.line_me_client_secret
  }))

  // Parse access token.
  const respParts = acc.data.id_token.split('.')
  const payload = JSON.parse(Buffer.from(respParts[1], 'base64').toString('utf8'))
  const sygniture = Buffer.from(respParts[2], 'base64').toString('hex')

  // Validate access token.
  const hmac = crypto.createHmac('sha256', client_secret)
  hmac.update(respParts[0] + '.' + respParts[1])
  if (hmac.digest('hex') !== sygniture) {
    logger.error('mismatched sygniture')
    return { error: 'mismatched sygniture' }
  } else if (payload.nonce !== req.nonce) {
    logger.error('mismatched nonce: ' + payload.nonce + ' / ' + req.nonce)
    return { error: 'mismatched nonce' }
  } else if (payload.iss !== params.line_me_iss) {
    logger.error('mismatched iss')
    return { error: 'mismatched iss' }
  } else if (payload.aud !== params.line_me_client_id) {
    logger.error('mismatched aud')
    return { error: 'mismatched aud' }
  } else if (payload.exp < ((new Date()).getTime() / 1000)) {
    logger.error('expired token ID')
    return { error: 'expired token ID' }
  } else if (req.link) {
    // Link LINE ID to the user.
    const docRef = db.collection('accounts').doc(req.link)
    const user = await docRef.get()
    if (user && user.exists) {
      await docRef.update({
        line_me: payload.sub
      })
      logger.info('link LINE: ' + req.link)
      return { token: null }
    } else {
      logger.error('failed to get account: ' + req.link)
      return { error: 'failed to get account: ' + req.link }
    }
  } else {
    // On sing in,
    // Get data of sub.
    const snapshot = await db.collection('accounts').where('line_me', '==', payload.sub).get()
    if (snapshot.size === 1) {
      // Return token.
      const user = snapshot.docs.reduce((ret, cur) => cur || ret, null)
      logger.info('Return token: ' + user.id)
      return { token: await auth.createCustomToken(user.id) }
    } else {
      logger.error('no data of sub: ' + payload.sub)
      return { error: 'no data of sub: ' + payload.sub }
    }
  }
}

module.exports = {
  signInWithLine
}
