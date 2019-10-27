const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const querystring = require('querystring')
const crypto = require('crypto')

// UI
const UI_URL = 'https://tamuro-dev1.web.app/'

// LINE
const LINE_CLIENT_ID = '1653379416'
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token'
const LINE_ISS = 'https://access.line.me'

// Setup Firebase admin user
admin.initializeApp()
const db = admin.firestore()

// HTTP API for tamuro
const appTamuro = express();
appTamuro.use(cors({ origin: true }))
appTamuro.use(express.json()) 

// HTTP API: initialize Service
appTamuro.get('/initialize', async (req, res) => {
  let users = await db.collection('users').get()
  if (users.size) {
    res.send({ token: null })
  } else {
    const version = '0000000000'
    const ts = new Date()
    let user = await db.collection('users').add({
      name: 'Administrator',
      invitedAt: ts,
      createdAt: ts,
      updatedAt: ts
    })
    await db.collection('service').doc('status').set({
      version
    })
    await db.collection('groups').doc('top').set({
      name: 'Tamuro',
      users: 'all',
      createdAt: ts,
      updatedAt: ts
    })
    await db.collection('groups').doc('admin').set({
      name: 'Administrators',
      users: [ user.id ],
      createdAt: ts,
      updatedAt: ts
    })
    await db.collection('groups').doc('manager').set({
      name: 'Managers',
      users: [ user.id ],
      createdAt: ts,
      updatedAt: ts
    })
    const token = await admin.auth().createCustomToken(user.id)
    res.send({ url: UI_URL + '?v=' + version + '&invitation=' + token })
  }
})

exports.tamuro = functions.https.onRequest(appTamuro);

// HTTP API: Get invitation URL
exports.getInvitationUrl = functions.https.onCall(async (data, context) => {
  await db.collection('users').doc(data.id).update({ invitedAt: new Date() })
  let status = await db.collection('service').doc('status').get()
  const token = await admin.auth().createCustomToken(data.id)
  return UI_URL + '?v=' + status.data().version + '&invitation=' + token
})

// HTTP API: Unlink Line
exports.unlinkLine = functions.https.onCall(async (data, context) => {
  await admin.auth().setCustomUserClaims(context.auth.uid, { lineUid: null })
})

// HTTP API: on Sing in with LINE
exports.signInWithLine = functions.https.onCall(async (data, context) => {
  // Get post data.
  const link = data.link
  const code = data.code
  const redirect_uri = data.redirect_uri
  const nonce = data.nonce

  // Get client secret.
  let secrets = await db.collection('service').doc('secrets').get()
  const LINE_CLIENT_SECRET = secrets.data().line_client_secret

  // Get access token.
  let acc = await axios.post(LINE_TOKEN_URL, querystring.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
    client_id: LINE_CLIENT_ID,
    client_secret: LINE_CLIENT_SECRET
  }))

  // Parse access token.
  let respParts = acc.data.id_token.split('.')
  let payload = JSON.parse(Buffer.from(respParts[1], 'base64').toString('utf8'))
  let sygniture = Buffer.from(respParts[2], 'base64').toString('hex')

  // Validate access token.
  const hmac = crypto.createHmac('sha256', LINE_CLIENT_SECRET)
  hmac.update(respParts[0] + '.' + respParts[1])
  if (hmac.digest('hex') !== sygniture) {
    console.error('mismatched sygniture')
    return { error: 'mismatched sygniture' }
  } else if (payload.nonce !== nonce) {
    console.error('mismatched nonce: ' + payload.nonce + ' / ' + nonce)
    return { error: 'mismatched nonce' }
  } else if (payload.iss !== LINE_ISS) {
    console.error('mismatched iss')
    return { error: 'mismatched iss' }
  } else if (payload.aud !== LINE_CLIENT_ID) {
    console.error('mismatched aud')
    return { error: 'mismatched aud' }
  } else if (payload.exp < ((new Date()).getTime() / 1000)) {
    console.error('expired token ID')
    return { error: 'expired token ID' }
  } else if (link) {
    // Link LINE ID to the user.
    let docRef = db.collection('users').doc(link)
    let user = await docRef.get()
    if (user && user.exists) {
      await docRef.update({
        lineUid: payload.sub
      })
      console.info('link LINE: ' + link)
      return { token: null }
    } else {
      console.error('no data of invitation: ' + invitation)
      return { error: 'no data of invitation: ' + invitation }
    }
  } else {
    // On sing in,
    // Get data of sub.
    let snapshot = await db.collection('users').where('lineUid', '==', payload.sub).get()
    if (snapshot.size === 1) {
      // Return token.
      let user = snapshot.docs.reduce((ret, cur) => cur ? cur : ret, null)
      console.info('Return token: ' + user.id)
      return { token: await admin.auth().createCustomToken(user.id) }
    } else {
      console.error('no data of sub: ' + payload.sub)
      return { error: 'no data of sub: ' + payload.sub }
    }
  }
})
