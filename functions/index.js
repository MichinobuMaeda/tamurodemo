const express = require('express')
const cors = require('cors')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { updateVersion } = require('./service')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()

const app = express()

const hasValidKey = async req => {
  const apiKey = req.query.key
  if (!apiKey) {
    return false
  }
  const conf = await db.collection('service').doc('conf').get()
  return conf.data().apiKey === apiKey
}

const apiKeyValidator = async (req, res, next) => {
  if (!(await hasValidKey(req))) {
    res.status(401)
    return res.send('401 Unauthorized')
  }
  console.log(req.url)
  return next()
}

app.use(cors({ origin: true }))
app.use(apiKeyValidator)
app.get(
  '/updateServiceVersion',
  async (req, res) => {
    return res.send(await updateVersion(db))
  })

exports.api = functions.https.onRequest(app)
