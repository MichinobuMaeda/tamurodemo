const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const axios = require('axios')
const querystring = require('querystring')
const crypto = require('crypto')

// Setup Firebase admin user connection
admin.initializeApp()
const db = admin.firestore()
const projectId = admin.instanceId().app.options.projectId
const dyanmicLinkGenerator = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key='

// Get URL of UI
const getUiUrl = () => db.collection('service').doc('ui').get().then(ui => ui.data().url)

// Initialize HTTP API for tamuro
const appTamuro = express();
appTamuro.use(cors({ origin: true }))
appTamuro.use(express.json()) 

// Shorten URL
const shortenURL = async url => {
  let ui = await db.collection('service').doc('ui').get()
  let result = await axios.post(dyanmicLinkGenerator + ui.data().webApiKey, {
    dynamicLinkInfo: {
      domainUriPrefix: ui.data().shortLinkPrefix,
      link: url
    }
  })
  return result.data.shortLink
}

const isManager = async id => {
  let manager = await db.collection('groups').doc('manager').get()
  return manager.data().members.includes(id)
}

const isAdmin = async id => {
  let admin = await db.collection('groups').doc('admin').get()
  return admin.data().members.includes(id)
}

// Add the doc if it's not exists.
const addDocIfNotExist = async (db, collection, name, data) => {
  let ref = db.collection(collection).doc(name)
  let doc = await ref.get()
  if (!(doc && doc.exists)) {
    await ref.set(data)
  }
}

// Create basic docs.
const setup = async () => {
  const ts = new Date()
  await addDocIfNotExist(db, 'service', 'status', {
    version: '0000000000',
    timezone: 'Asia/Tokyo',
    locale: 'ja-jp'
  })
  await addDocIfNotExist(db, 'service', 'ui', {
    url: 'https://' + projectId + '.web.app/',
    webApiKey: '',
    shortLinkPrefix: ''
  })
  await addDocIfNotExist(db, 'service', 'line', {
    grant_type: 'authorization_code',
    client_id: '',
    client_secret: '',
    scope: 'profile openid',
    iss: 'https://access.line.me',
    auth_url: 'https://access.line.me/oauth2/v2.1/authorize',
    token_url: 'https://api.line.me/oauth2/v2.1/token'
  })
  await addDocIfNotExist(db, 'groups', 'top', {
    name: 'Tamuro',
    members: [],
    subGroups: [ 'admin', 'manager' ],
    createdAt: ts,
    updatedAt: ts
  })
  await addDocIfNotExist(db, 'groups', 'admin', {
    name: 'Administrators',
    members: [],
    subGroups: [],
    createdAt: ts,
    updatedAt: ts
  })
  await addDocIfNotExist(db, 'groups', 'manager', {
    name: 'Managers',
    members: [],
    subGroups: [],
    createdAt: ts,
    updatedAt: ts
  })
}

// Add a user
const createUser = async (name, ts, status) => {
  let user = await db.collection('users').add({
    name,
    createdAt: ts,
    updatedAt: ts
  })
  await db.collection('profiles').doc(user.id).set({
    createdAt: ts,
    updatedAt: ts
  })
  await db.collection('accounts').doc(user.id).set({
    menuPosition: status.data().menuPosition,
    timezone: status.data().timezone,
    locale: status.data().locale,
    valid: true,
    createdAt: ts,
    updatedAt: ts
  })
  return user.id
}

// HTTP API: setup the service
appTamuro.get('/setup', async (req, res) => {
  // Create basic docs.
  await setup()
  res.send('status: ok\n')
})

// HTTP API: initialize the primary user and groups
appTamuro.get('/initialize', async (req, res) => {
  // Create basic docs.
  await setup()
  let status = await db.collection('service').doc('status').get()
  let accounts = await db.collection('accounts').get()
  if (accounts.size) {
    res.send('status: warn\nAlready initialized.\n')
  } else {
    const ts = new Date()
    const id = await createUser('Administrator', ts, status)
    await db.collection('groups').doc('admin').update({
      members: [ id ],
      updatedAt: ts
    })
    await db.collection('groups').doc('manager').update({
      members: [ id ],
      updatedAt: ts
    })
    const token = await admin.auth().createCustomToken(id)
    const url = await getUiUrl()
    const shortUrl = await shortenURL(url + '?v=' + status.data().version + '&invitation=' + token)
    await db.collection('accounts').doc(id).update({
      invitedAt: ts
    })
    res.send('status: ok\n' + shortUrl + '\n')
  }
})

// HTTP API: Release new version of the UI.
appTamuro.get('/release/ui/:webApiKey', async (req, res) => {
  let ui = await db.collection('service').doc('ui').get()
  if (ui.data().webApiKey !== req.params.webApiKey) {
    res.send('status: error\n')
  } else {
    let result = await axios.get('https://' + projectId + '.web.app/statics/version.json')
    await db.collection('service').doc('status').update({
      version: result.data
    })
    res.send('version: ' + result.data + '\n')
  }
})

// Setup HTTP API for tamuro
exports.tamuro = functions.https.onRequest(appTamuro);

// HTTP Callable API: Get auth ids for clients.
exports.getAuthIds = functions.https.onCall(async (data, context) => {
  const url = await getUiUrl()
  let line = await db.collection('service').doc('line').get()
  return {
    ui: { url },
    line: {
      auth_url: line.data().auth_url,
      client_id: line.data().client_id,
      scope: line.data().scope
    }
  }
})

// HTTP Callable API: Get invitation URL
exports.getInvitationUrl = functions.https.onCall(async (data, context) => {
  if ((!(await isManager(context.auth.uid))) && (!(await isAdmin(context.auth.uid)))) {
    return null
  }
  console.info({ uid: context.auth.uid, target: data.id })
  let status = await db.collection('service').doc('status').get()
  const token = await admin.auth().createCustomToken(data.id)
  const url = await getUiUrl()
  const shortUrl = await shortenURL(url + '?v=' + status.data().version + '&invitation=' + token)
  await db.collection('accounts').doc(data.id).update({ invitedAt: new Date() })
  return { url: shortUrl }
})

// HTTP Callable API: Get email address
exports.getAccountEmail = functions.https.onCall(async (data, context) => {
  if ((!(await isManager(context.auth.uid))) && (!(await isAdmin(context.auth.uid)))) {
    return { email: null }
  }
  console.info({ uid: context.auth.uid, target: data.id })
  let user = await admin.auth().getUser(data.id)
  return { email: (user ? user.email : null) }
})

// HTTP Callable API: Set email address
exports.setAccountEmail = functions.https.onCall(async (data, context) => {
  if ((!(await isManager(context.auth.uid))) && (!(await isAdmin(context.auth.uid)))) {
    return { email: null }
  }
  console.info({ uid: context.auth.uid, target: data.id })
  await admin.auth().updateUser(data.id, {
    email: data.email
  })
  let user = await admin.auth().getUser(data.id)
  return { email: (user ? user.email : null) }
})

// HTTP Callable API: on Sing in with LINE
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
    let docRef = db.collection('accounts').doc(link)
    let user = await docRef.get()
    if (user && user.exists) {
      await docRef.update({
        line_me: payload.sub
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
    let snapshot = await db.collection('accounts').where('line_me', '==', payload.sub).get()
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

// HTTP Callable API: Create member
exports.createMember = functions.https.onCall(async (data, context) => {
  if (!(await isManager(context.auth.uid))) {
    return null
  }
  console.info({ id: data.id, name: data.name })
  const ts = new Date()
  let status = await db.collection('service').doc('status').get()
  const id = await createUser(data.name, ts, status)
  const groupRef = db.collection('groups').doc(data.id)
  await groupRef.update({
    members: admin.firestore.FieldValue.arrayUnion(id),
    updatedAt: ts
  })
  return { id }
})
