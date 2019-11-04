const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const querystring = require('querystring')
const crypto = require('crypto')

// UI
const UI_URL = 'https://tamuro-dev1.web.app/'

// Setup Firebase admin user
admin.initializeApp()
const db = admin.firestore()

// HTTP API for tamuro
const appTamuro = express();
appTamuro.use(cors({ origin: true }))
appTamuro.use(express.json()) 

// HTTP API: initialize Service
const addDocIfNotExist = async (db, collection, name, data) => {
  let ref = db.collection(collection).doc(name)
  let doc = await ref.get()
  if (!(doc && doc.exists)) {
    await ref.set(data)
  }
}

const setup = async () => {
  const ts = new Date()
  await addDocIfNotExist(db, 'service', 'status', {
    version: '0000000000'
  })
  await addDocIfNotExist(db, 'service', 'ui', {
    url: '[Project ID].web.app'
  })
  await addDocIfNotExist(db, 'service', 'line', {
    grant_type: 'authorization_code',
    client_id: '',
    client_secret: '',
    iss: 'https://access.line.me',
    auth_url: 'https://access.line.me/oauth2/v2.1/authorize',
    token_url: 'https://api.line.me/oauth2/v2.1/token'
  })
}

appTamuro.get('/setup', async (req, res) => {
  await setup()
  res.send({ status: 'ok' })
})

appTamuro.get('/initialize', async (req, res) => {
  await setup()
  let users = await db.collection('users').get()
  if (users.size) {
    res.send({ url: null })
  } else {
    const ts = new Date()
    let user = await db.collection('users').add({
      name: 'Administrator',
      invitedAt: ts,
      createdAt: ts,
      updatedAt: ts
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
    let status = await db.collection('service').doc('status').get()
    let ui = await db.collection('service').doc('ui').get()
    res.send({ url: ui.data().url + '?v=' + status.data().verison + '&invitation=' + token })
  }
})

exports.tamuro = functions.https.onRequest(appTamuro);

// HTTP API: Get invitation URL
exports.getInvitationUrl = functions.https.onCall(async (data, context) => {
  await db.collection('users').doc(data.id).update({ invitedAt: new Date() })
  let ui = await db.collection('service').doc('ui').get()
  let status = await db.collection('service').doc('status').get()
  const token = await admin.auth().createCustomToken(data.id)
  return ui.data().url + '?v=' + status.data().version + '&invitation=' + token
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
  let lineService = await db.collection('service').doc('line').get()
  const grant_type = lineService.data().grant_type
  const client_id = lineService.data().client_id
  const client_secret = lineService.data().client_secret
  const token_url = lineService.data().token_url
  const iss = lineService.data().iss
  
  // Get access token.
  let acc = await axios.post(token_url, querystring.stringify({
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret
  }))

  // Parse access token.
  let respParts = acc.data.id_token.split('.')
  let payload = JSON.parse(Buffer.from(respParts[1], 'base64').toString('utf8'))
  let sygniture = Buffer.from(respParts[2], 'base64').toString('hex')

  // Validate access token.
  const hmac = crypto.createHmac('sha256', client_secret)
  hmac.update(respParts[0] + '.' + respParts[1])
  if (hmac.digest('hex') !== sygniture) {
    console.error('mismatched sygniture')
    return { error: 'mismatched sygniture' }
  } else if (payload.nonce !== nonce) {
    console.error('mismatched nonce: ' + payload.nonce + ' / ' + nonce)
    return { error: 'mismatched nonce' }
  } else if (payload.iss !== iss) {
    console.error('mismatched iss')
    return { error: 'mismatched iss' }
  } else if (payload.aud !== client_id) {
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
