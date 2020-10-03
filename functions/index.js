const express = require('express')
const cors = require('cors')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { apiKeyValidator, api } = require('./api')
const { updateVersion } = require('./service')

admin.initializeApp()
const db = admin.firestore()
const auth = admin.auth()

api.use(apiKeyValidator(db))

api.get('/updateServiceVersion', async (req, res) => {
  return res.send(await updateVersion(db))
})

exports.api = functions.https.onRequest(api)
